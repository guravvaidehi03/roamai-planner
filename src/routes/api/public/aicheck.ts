import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/aicheck")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ hasKey: Boolean(process.env["LOVABLE_API_KEY"]) });
      },
    },
  },
});
