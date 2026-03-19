import { Link } from "react-router-dom";

export default function BusinessCard({ business }) {
  return (
    <div>
      <h2>{business.name}</h2>
      <p>{business.category}</p>
      <p>⭐ {business.rating}</p>
      <Link to={`/business/${business.id}`}>View</Link>
    </div>
  );
}