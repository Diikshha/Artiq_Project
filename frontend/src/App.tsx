// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home              from "./components/Home";
import Signup            from "./components/Signup";
import Login             from "./components/Login";
import CustomerDashboard from "./components/Customerdashboard";
import TailorDashboard   from "./components//Tailordashboard";
import CustomerProfile   from "./components/custProfile";
import TailorProfile     from "./components/TailorProfile";
import RateAndReview     from "./components/Rateandreview";
import FindTailor        from "./components/Findtailor";
import ChangePassword    from "./components/Changepassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/"                   element={<Home />} />

        {/* Auth */}
        <Route path="/signup"             element={<Signup />} />
        <Route path="/login"              element={<Login />} />

        {/* Dashboards */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/tailor-dashboard"   element={<TailorDashboard />} />

        {/* Customer sub-pages */}
        <Route path="/customer-profile"   element={<CustomerProfile />} />
        <Route path="/find-tailor"        element={<FindTailor />} />
        <Route path="/rate-review"        element={<RateAndReview />} />
        <Route path="/change-password"    element={<ChangePassword />} />

        {/* Tailor profile standalone (legacy) */}
        <Route path="/tailor-profile"     element={<TailorProfile />} />

        {/* Fallback */}
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}