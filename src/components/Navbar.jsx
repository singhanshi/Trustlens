import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 flex justify-between items-center shadow-md">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold tracking-wide">
        TrustLens
      </h1>

      {/* Links */}
      <div className="flex gap-8 text-lg">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>
      </div>

    </div>
  );
}

export default Navbar;