import { Routes, Route } from "react-router-dom";
import { AdminPage } from "./pages/admin";
import { HomePage } from "./pages/home";
import { Toaster } from "@/components/ui/sonner"; // ✅ Import Toaster

function App() {
  return (
    <>
      {/* ✅ Toast notifications provider */}
      <Toaster richColors position="top-right" />

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Routes Page */}
        <Route path="/routes" element={<HomePage />} />
        <Route path="/:tab" element={<HomePage />} />

        {/* Admin Page */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;