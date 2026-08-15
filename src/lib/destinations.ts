export type Destination = {
  id: string;
  name: string;
  country: string;
  category: "Beach" | "Mountains" | "Historical" | "Food" | "Adventure" | "Nature" | "Shopping";
  rating: number;
  budget: string;
  description: string;
  image: string;
};

// Curated Unsplash photos (stable IDs, license-free)
export const DESTINATIONS: Destination[] = [
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    category: "Beach",
    rating: 4.9,
    budget: "₹1,49,000",
    description: "Whitewashed cliffs, cobalt domes and the Aegean at sunset.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    category: "Historical",
    rating: 4.8,
    budget: "₹1,74,000",
    description: "Ancient shrines, bamboo groves and quiet tea houses.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "banff",
    name: "Banff",
    country: "Canada",
    category: "Mountains",
    rating: 4.9,
    budget: "₹1,33,000",
    description: "Turquoise lakes cradled by the Canadian Rockies.",
    image: "https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    category: "Shopping",
    rating: 4.7,
    budget: "₹91,000",
    description: "Souks, spice markets and the Red City's endless colour.",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    category: "Adventure",
    rating: 4.9,
    budget: "₹1,99,000",
    description: "Bungee jumps, glacier hikes and lakeside vineyards.",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    category: "Nature",
    rating: 4.8,
    budget: "₹75,000",
    description: "Emerald rice terraces, temples and volcanic sunrises.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    category: "Historical",
    rating: 4.8,
    budget: "₹1,41,000",
    description: "2000 years of empire, art, and unforgettable pasta.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    category: "Food",
    rating: 4.7,
    budget: "₹66,000",
    description: "Street food temples and neon night markets after dusk.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    category: "Beach",
    rating: 4.9,
    budget: "₹2,66,000",
    description: "Overwater villas floating on impossible blue.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "patagonia",
    name: "Patagonia",
    country: "Argentina",
    category: "Adventure",
    rating: 4.9,
    budget: "₹2,32,000",
    description: "Windswept peaks, glaciers and the edge of the world.",
    image: "https://images.unsplash.com/photo-1531177071211-ed1728fe442a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "iceland",
    name: "Reykjavík",
    country: "Iceland",
    category: "Nature",
    rating: 4.8,
    budget: "₹2,16,000",
    description: "Northern lights, geysers and lunar volcanic plains.",
    image: "https://images.unsplash.com/photo-1500043357865-c6b8827edf10?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    category: "Shopping",
    rating: 4.6,
    budget: "₹1,83,000",
    description: "Sky-high towers, desert dunes and gold-lit souks.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
];

export const CATEGORIES = [
  "All",
  "Beach",
  "Mountains",
  "Historical",
  "Food",
  "Adventure",
  "Nature",
  "Shopping",
] as const;
