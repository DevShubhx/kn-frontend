import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Schedule from './pages/WeeklySchedule'
import Catalog from './pages/Catalog'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/adminDashboard'
import ShowPage from './pages/ShowPage'
import WatchPage from './pages/WatchPage';
import GenreCatalog from './pages/GenreCatalog';
import LiveTVPage from './pages/Live'; // 🎯 NEW IMPORT: आपका नया लाइव टीवी पेज
import ForgotPassword from './pages/ForgotPassword';
// src/App.jsx के बिल्कुल शीर्ष पर अन्य इम्पोर्ट्स के साथ इसे जोड़ें:
import CartoonTheatre from './pages/CartoonTheatre'; // 🔒 सुनिश्चित करें कि फ़ाइल का पाथ बिल्कुल सही है
import Ppick from './pages/Ppick';
import NewShows from './pages/NewShows';
import WeeklySchedule from './pages/WeeklySchedule';




function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Page 1: Cinematic Wallpaper Screen */}
        <Route path="/" element={<Welcome />} />

        {/* Route for page 2: Catalog Show Grid List */}
        <Route path="/catalog" element={<Catalog />} />

        {/* 🎯 NEW ROUTE: आपका नया सिम्युलेटेड लाइव टीवी पाथ */}
        <Route path="/Live" element={<LiveTVPage />} />

        {/* Route for page 3: Sign Up Screen */}
        <Route path="/register" element={<Signup />} />

        {/* Route for page 4: Log in Screen */}
        <Route path="/login" element={<Login />} />

        {/* 🎯 FIXED HIGH ACCURACY: कार्टून थिएटर का रास्ता रिएक्ट इंजन में 100% लॉक करना */}
        <Route path="/theatre" element={<CartoonTheatre />} />

        <Route path="/compick" element={<Ppick />} />

        <Route path="/new-shows" element={<NewShows />} />

        <Route path="/weekly-schedule" element={<WeeklySchedule />} />


        {/* Secret Admin Login Path */}
        <Route path="/secret-admin-entrance-99" element={<AdminDashboard />} />

        {/* Dynamic Player Screen Route View */}
        <Route path="/show/:id" element={<ShowPage />} />

        <Route path="/watch" element={<WatchPage />} />

        <Route path="/genre/:genreName" element={<GenreCatalog />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />



        {/* Fall Back to Home */}
        <Route path="*" element={<Welcome />} />
      </Routes>
    </Router>
  )
}

export default App
