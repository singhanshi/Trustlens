import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import BusinessPage from "./pages/BusinessPage.jsx";
import Admin from "./pages/Admin.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;