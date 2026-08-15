import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  destination: z.string().min(2),
  days: z.number().int().min(1).max(30),
  budget: z.string(),
  travelers: z.string(),
  interests: z.array(z.string()).default([]),
  tripType: z.string(),
  transport: z.string(),
  hotelPreference: z.string(),
});

export type TripPlan = {
  summary: string;
  best_time_to_visit: string;
  itinerary: Array<{
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
  }>;
  recommended_places: Array<{ name: string; type: string; why: string }>;
  restaurants: Array<{ name: string; cuisine: string; note: string }>;
  hotels: Array<{ name: string; area: string; price_range: string }>;
  budget_breakdown: Array<{ category: string; amount: string; note: string }>;
  travel_tips: string[];
  packing_list: string[];
  emergency_tips: string[];
};

export const generateTripPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = (process.env["GROQ_API_KEY"] ?? process.env["VITE_GROQ_API_KEY"] ?? "").trim();
    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured in the server runtime");
      throw new Error(
        "AI service is not configured: the GROQ_API_KEY secret is missing on the server.",
      );
    }
    const model = (process.env["GROQ_MODEL"] ?? "llama-3.3-70b-versatile").trim();


    const prompt = `You are RoamAI, an expert local travel planner. Generate a detailed, realistic, personalized travel plan.

TRIP DETAILS:
- Destination: ${data.destination}
- Duration: ${data.days} days
- Budget: ${data.budget}
- Travelers: ${data.travelers}
- Trip type: ${data.tripType}
- Interests: ${data.interests.join(", ") || "general sightseeing"}
- Transport: ${data.transport}
- Accommodation: ${data.hotelPreference}

Return a JSON object matching this exact schema:
{
  "summary": "2-3 sentence enticing overview of the trip",
  "best_time_to_visit": "one sentence",
  "itinerary": [{ "day": 1, "title": "...", "morning": "...", "afternoon": "...", "evening": "..." }],
  "recommended_places": [{ "name": "...", "type": "landmark|museum|park|viewpoint", "why": "..." }],
  "restaurants": [{ "name": "...", "cuisine": "...", "note": "..." }],
  "hotels": [{ "name": "...", "area": "...", "price_range": "..." }],
  "budget_breakdown": [{ "category": "Accommodation|Food|Transport|Activities|Misc", "amount": "₹...", "note": "..." }],
  "travel_tips": ["..."],
  "packing_list": ["..."],
  "emergency_tips": ["..."]
}

Rules:
- itinerary must contain exactly ${data.days} entries.
- recommended_places: 6 items. restaurants: 5. hotels: 4. budget_breakdown: 5. travel_tips: 6. packing_list: 8. emergency_tips: 4.
- Use real place names for ${data.destination}. Be specific.
- All monetary values (budget_breakdown amounts and hotel price_range) MUST be in Indian Rupees using the ₹ symbol with Indian digit grouping (e.g. "₹1,25,000", "₹8,000 - ₹12,000 per night"). Never use $, USD, EUR or any other currency.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a professional travel planner. Always respond with valid JSON only, no markdown fences." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Groq API error", res.status, text);
      if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (res.status === 401 || res.status === 403)
        throw new Error("Invalid or unauthorized Groq API key. Please update the GROQ_API_KEY secret.");
      let detail = text.slice(0, 300);
      try {
        const parsedErr = JSON.parse(text) as { error?: { message?: string } };
        if (parsedErr.error?.message) detail = parsedErr.error.message;
      } catch {
        // keep raw text
      }
      if (res.status === 404 || /decommissioned|does not exist|model_not_found/i.test(detail)) {
        throw new Error(`Groq model "${model}" is unavailable: ${detail}`);
      }
      throw new Error(`AI planner failed (${res.status}): ${detail}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const content = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: TripPlan;
    try {
      parsed = JSON.parse(content) as TripPlan;
    } catch {
      console.error("AI returned non-JSON content", raw.slice(0, 500));
      throw new Error("AI returned malformed plan. Please retry.");
    }

    return parsed;
  });
