import { useParams, Link } from "react-router-dom";

export default function BusinessDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Business {id}</h1>
      <p>Details about business...</p>

      <Link to={`/review/${id}`}>Write Review</Link>
    </div>
  );
}