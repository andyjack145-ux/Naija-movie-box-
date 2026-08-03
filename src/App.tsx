import React from 'react'
import {
  HashRouter as Router,
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
import { Search } from './pages/Search'
import { Admin } from './pages/Admin'
import { Watchlist } from './pages/Watchlist'
import { SubmitMovie } from './pages/SubmitMovie'

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
                <Route path="/search" element={<Search />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/submit" element={<SubmitMovie />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}
