import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

// Dummy Data
const businesses = [
  { id: 1, name: "Pizza Palace", category: "Restaurant", location: "New York", rating: 4.5 },
  { id: 2, name: "Glow Salon", category: "Service", location: "Los Angeles", rating: 4.2 },
  { id: 3, name: "Burger Hub", category: "Restaurant", location: "New York", rating: 4.0 }
];

// Navbar
function Navbar() {
  return (
    <nav className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold tracking-tight">ReviewHub</Link>
      <div className="space-x-6 text-sm font-medium">
        <Link to="/login" className="hover:text-gray-600">Login</Link>
        <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-full hover:scale-105 transition">Get Started</Link>
      </div>
    </nav>
  );
}

// Star Rating Component
function Stars({ rating }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
      ))}
    </div>
  );
}

// Home Page
function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || b.category === category) &&
    (location === "All" || b.location === location)
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover great businesses</h1>
          <p className="text-gray-500">Search, filter and review places around you</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search for restaurants, salons..."
          className="w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black mb-6"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            className="p-3 rounded-xl border bg-white"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Service">Service</option>
          </select>

          <select
            className="p-3 rounded-xl border bg-white"
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="All">All Locations</option>
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
          </select>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((b) => (
              <Link key={b.id} to={`/business/${b.id}`}>
                <div className="bg-white p-6 rounded-2xl border hover:shadow-xl hover:-translate-y-2 transition duration-300 group">
                  <div className="mb-3 h-40 bg-gray-200 rounded-xl"></div>
                  <h2 className="text-xl font-semibold group-hover:underline">{b.name}</h2>
                  <p className="text-gray-500 text-sm">{b.category} • {b.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={Math.round(b.rating)} />
                    <span className="text-sm text-gray-500">{b.rating}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Business Detail
function BusinessDetail() {
  const { id } = useParams();
  const business = businesses.find(b => b.id === parseInt(id));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="h-60 bg-gray-200 rounded-2xl mb-6"></div>
        <h1 className="text-4xl font-bold">{business.name}</h1>
        <p className="text-gray-500">{business.category} • {business.location}</p>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={Math.round(business.rating)} />
          <span>{business.rating}</span>
        </div>

        <Link
          to={`/review/${business.id}`}
          className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition"
        >
          Write a Review
        </Link>
      </div>
    </div>
  );
}

// Review Form
function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Write a Review</h1>

        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map((i) => (
            <span
              key={i}
              onClick={() => setRating(i)}
              className={`cursor-pointer text-2xl ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Share your experience..."
          className="w-full p-3 border rounded-lg mb-4"
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800">
          Submit Review
        </button>
      </div>
    </div>
  );
}

// Login
function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input placeholder="Email" className="w-full p-3 border rounded-lg mb-3" />
        <input placeholder="Password" type="password" className="w-full p-3 border rounded-lg mb-4" />
        <button className="w-full bg-black text-white py-3 rounded-full">Login</button>
      </div>
    </div>
  );
}

// Signup
function Signup() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Signup</h1>
        <input placeholder="Email" className="w-full p-3 border rounded-lg mb-3" />
        <input placeholder="Password" type="password" className="w-full p-3 border rounded-lg mb-4" />
        <button className="w-full bg-black text-white py-3 rounded-full">Create Account</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/review/:id" element={<ReviewForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
