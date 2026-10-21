import React from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import ProtectedRoute from "./components/ProtectedRoute.js"
import { HomePage } from './pages/HomePage.js';
import { MovieDetails } from './pages/MovieDetails.js';
import { BookingPage } from './pages/BookingPage.js'
import { Login } from './components/Login.js';
import { Register } from './components/Register.js';
import { ForgotPassword } from './components/ForgotPassword.js';
import { AdminDashboard } from "./pages/AdminDashboard.js"
import { ProfilePage } from './pages/ProfilePage.js'
import { FavoritePage } from './pages/FavoritePage.js'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/register' element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />

        {/* Any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritePage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
