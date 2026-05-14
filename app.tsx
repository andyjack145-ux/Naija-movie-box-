import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'

import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { MovieDetail } from './pages/MovieDetail'
import { Player } from './pages/Player'
import { Downloads } from './pages/Downloads'
import { Profile } from './pages/Profile'
import { Upgrade } from './pages/Upgrade'

import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'

import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="bg-black text-white min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/player/:id" element={<Player />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/upgrade" element={<Upgrade />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}
