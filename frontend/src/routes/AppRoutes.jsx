import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import Chat from "../pages/Chat/Chat.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/accounts/profile" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
