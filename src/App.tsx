import { Routes, Route } from "react-router-dom";
import { AdminPage } from "./pages/admin"; // Your admin page
import { HomePage } from "./pages/home"; // Your home page with the form

function App() {
  return (
    <Routes>
      {/* Home Page */}
      <Route path="/" element={<HomePage />} />

      {/* Routes Page (renders the same HomePage component) */}
      <Route path="/routes" element={<HomePage />} />
      <Route path="/:tab" element={<HomePage />} />

      {/* Admin Page */}
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;