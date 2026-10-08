import React from 'react';
import { Routes, Route } from "react-router-dom";
import { HomePage } from './pages/HomePage.js';
import { MovieDetails } from './pages/MovieDetails.js';
import { BookingPage } from './pages/BookingPage.js'
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { AdminDashboard } from "./pages/AdminDashboard.js"


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route path="/booking/:id" element={<BookingPage />} />
      <Route path='/admin/dashboard' element={<AdminDashboard />} />
    </Routes>
  )
}
