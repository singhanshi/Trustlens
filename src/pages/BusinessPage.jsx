import { useParams } from "react-router-dom";

function BusinessPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-4">Pizza Hub</h1>
        <p className="text-gray-500 mb-2">Restaurant • Delhi</p>

        <div className="text-yellow-500 text-xl font-semibold mb-6">
          ⭐ 4.2
        </div>

        {/* Ratings */}
        <div className="mb-6 space-y-1">
          <p>Quality: ⭐⭐⭐⭐☆</p>
          <p>Service: ⭐⭐⭐⭐☆</p>
          <p>Value: ⭐⭐⭐☆☆</p>
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Reviews</h2>
          <p className="text-gray-600">Great food and fast service!</p>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          Add Review
        </button>

      </div>
    </div>
  );
}

export default BusinessPage;