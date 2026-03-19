import { Link } from "react-router-dom";

const businesses = [
  {
    id: 1,
    name: "Pizza Hub",
    category: "Restaurant",
    location: "Delhi",
    rating: 4.2,
  },
  {
    id: 2,
    name: "Tech Store",
    category: "Shop",
    location: "Noida",
    rating: 4.5,
  },
];

function Home() {
  return (
   <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 px-12 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Filter */}
        <select className="mb-10 px-4 py-2 border rounded-lg shadow-sm">
          <option>All</option>
          <option>Restaurant</option>
          <option>Shop</option>
        </select>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {businesses.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border text-left"
            >
              <h2 className="text-xl font-semibold mb-1">
                {b.name}
              </h2>

              <p className="text-gray-500">{b.category}</p>
              <p className="text-gray-500">{b.location}</p>

              <div className="mt-3 text-yellow-500 font-semibold text-lg">
                ⭐ {b.rating}
              </div>

              <Link to={`/business/${b.id}`}>
                <button className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  View Details
                </button>
              </Link>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Home;