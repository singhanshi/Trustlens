import { useState } from "react";
import BusinessCard from "../components/BusinessCard";

const data = [
  { id: 1, name: "Pizza Place", category: "Restaurant", rating: 4.5 },
  { id: 2, name: "Salon", category: "Service", rating: 4.2 }
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = data.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map(b => (
        <BusinessCard key={b.id} business={b} />
      ))}
    </div>
  );
}