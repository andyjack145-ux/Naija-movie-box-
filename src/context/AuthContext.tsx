import React, { createContext, useContext, useState, useEffect } from 'react'

const USERS_KEY = 'naija_stream_users'
const SESSION_KEY = 'naija_stream_session'
const ADMIN_EMAIL = 'andyntuk@gmail.com'

export interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null as any)

function getStoredUsers(): Record<string, { name: string; password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStoredUsers(users: Record<string, { name: string; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(() => getSession())

  function login(email: string, password: string): { success: boolean; error?: string } {
    const normalised = email.toLowerCase()

    if (normalised === ADMIN_EMAIL) {
      const users = getStoredUsers()
      if (!users[ADMIN_EMAIL]) {
        users[ADMIN_EMAIL] = { name: 'Admin', password }
        saveStoredUsers(users)
      }
      const loggedIn: User = { email: ADMIN_EMAIL, name: 'Admin' }
      setUser(loggedIn)
      saveSession(loggedIn)
      return { success: true }
    }

    const users = getStoredUsers()
    const stored = users[normalised]
    if (!stored) {
      return { success: false, error: 'No account found with this email. Please sign up.' }
    }
    if (stored.password !== password) {
      return { success: false, error: 'Incorrect password.' }
    }
    const loggedIn: User = { email: normalised, name: stored.name }
    setUser(loggedIn)
    saveSession(loggedIn)
    return { success: true }
  }

  function signup(name: string, email: string, password: string): { success: boolean; error?: string } {
    if (!name.trim()) return { success: false, error: 'Please enter your name.' }
    if (!email.trim()) return { success: false, error: 'Please enter your email.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

    const users = getStoredUsers()
    if (users[email.toLowerCase()]) {
      return { success: false, error: 'An account with this email already exists. Please log in.' }
    }
    users[email.toLowerCase()] = { name: name.trim(), password }
    saveStoredUsers(users)

    const newUser: User = { email: email.toLowerCase(), name: name.trim() }
    setUser(newUser)
    saveSession(newUser)
    return { success: true }
  }

  function logout() {
    setUser(null)
    saveSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
