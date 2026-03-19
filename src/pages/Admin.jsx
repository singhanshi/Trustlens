import { useState } from "react";

function Admin() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      business: "Pizza Hub",
      user: "Anshika",
      text: "Amazing food!",
      status: "pending",
    },
    {
      id: 2,
      business: "Tech Store",
      user: "Rahul",
      text: "Good service",
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" } : r
      )
    );
  };

  const handleReject = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 px-12 py-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Admin Dashboard
        </h1>

        <div className="space-y-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-2xl shadow-md border"
            >
              <h2 className="text-xl font-semibold">
                {r.business}
              </h2>

              <p className="text-gray-500 text-sm">
                by {r.user}
              </p>

              <p className="mt-2 text-gray-700">
                {r.text}
              </p>

              <p className="mt-3 font-semibold">
                Status:{" "}
                <span
                  className={
                    r.status === "approved"
                      ? "text-green-600"
                      : r.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {r.status}
                </span>
              </p>

              {r.status === "pending" && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(r.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Admin;