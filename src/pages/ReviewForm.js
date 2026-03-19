import { useState } from "react";

export default function ReviewForm() {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    alert("Review Submitted");
  };

  return (
    <div>
      <h1>Submit Review</h1>

      <input
        type="number"
        placeholder="Rating"
        onChange={(e) => setRating(e.target.value)}
      />

      <textarea
        placeholder="Comment"
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}