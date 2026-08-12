import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import Servers from './pages/Servers'
import Deployments from './pages/Deployments'
import ServerDetail from './pages/ServerDetail'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-ink-black flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-white">
        Welcome, {user?.username}
      </h1>
      <div className="flex gap-4">
        <a href="/projects" className="text-sky-mist underline hover:text-white">
          View Projects
        </a>
        <a href="/servers" className="text-sky-mist underline hover:text-white">
          View Servers
        </a>
        <a href="/deployments" className="text-sky-mist underline hover:text-white">
          View Deployments
        </a>
      </div>
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
      >
        Logout
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ink-black">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servers"
            element={
              <ProtectedRoute>
                <Servers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servers/:id"
            element={
              <ProtectedRoute>
                <ServerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deployments"
            element={
              <ProtectedRoute>
                <Deployments />
              </ProtectedRoute>
  }
/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App