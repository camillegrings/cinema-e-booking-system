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
import { VerifyCode } from './components/VerifyCode.js'
import { ResetPassword } from './components/ResetPassword.js'
import { ManageMovie } from './pages/ManageMovie.js'
import { ManageShowtime } from './pages/ManageShowtime.js'
import { PaymentPage } from './pages/PaymentPage.js';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-code' element={<VerifyCode />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/register' element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />

        {/* Any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/movies' element={<ManageMovie />} />
          <Route path='/admin/showtime' element={<ManageShowtime />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
