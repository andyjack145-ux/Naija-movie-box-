import React, { useEffect } from 'react'  
import {  
  BrowserRouter as Router,  
  Routes,  
  Route,  
  useLocation,  
} from 'react-router-dom'  
import { Toaster } from 'sonner'  
import { AuthProvider } from './context/AuthContext'  
import { AppProvider } from './context/AppContext'  
import { Navbar } from './components/layout/Navbar'  
import { Footer } from './components/layout/Footer'  
// Pages  
import { Home } from './pages/Home'  
import { Login } from './pages/Login'  
import { Signup } from './pages/Signup'  
import { MovieDetail } from './pages/MovieDetail'  
import { Player } from './pages/Player'  
import { Profile } from './pages/Profile'  
import { Downloads } from './pages/Downloads'  
function ScrollToTop() {  
  const { pathname } = useLocation()  
  useEffect(() => {  
    window.scrollTo(0, 0)  
  }, [pathname])  
  return null  
}  
function AppContent() {  
  const location = useLocation()  
  const isAuthPage =  
    location.pathname === '/login' || location.pathname === '/signup'  
  const isPlayerPage = location.pathname.startsWith('/player')  
  return (  
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">  
      <ScrollToTop />  
      {!isAuthPage && !isPlayerPage && <Navbar />}  
  
      <main className="flex-1">  
        <Routes>  
          <Route path="/" element={<Home />} />  
          <Route path="/login" element={<Login />} />  
          <Route path="/signup" element={<Signup />} />  
          <Route path="/movie/:id" element={<MovieDetail />} />  
          <Route path="/player/:id" element={<Player />} />  
          <Route path="/profile" element={<Profile />} />  
          <Route path="/downloads" element={<Downloads />} />  
          {/* Fallback routes for categories/search to Home for now */}  
          <Route path="/category/:id" element={<Home />} />  
          <Route path="/search" element={<Home />} />  
        </Routes>  
      </main>  
  
      {!isAuthPage && !isPlayerPage && <Footer />}  
    </div>  
  )  
}  
export function App() {  
  return (  
    <AuthProvider>  
      <AppProvider>  
        <Router>  
          <AppContent />  
          <Toaster  
            theme="dark"  
            position="bottom-right"  
            toastOptions={{  
              style: {  
                background: '#1a1a1a',  
                border: '1px solid #333333',  
                color: '#fff',  
                borderRadius: '5px',  
              },  
            }}  
          />  
        </Router>  
      </AppProvider>  
    </AuthProvider>  
  )  
    }
