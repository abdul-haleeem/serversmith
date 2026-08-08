import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Dashboard() {
  return <h1 className="text-3xl font-bold text-white">Dashboard (placeholder)</h1>
}

function Login() {
  return <h1 className="text-3xl font-bold text-white">Login (placeholder)</h1>
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
        <nav className="flex gap-4">
          <Link className="text-blue-400 underline" to="/">Dashboard</Link>
          <Link className="text-blue-400 underline" to="/login">Login</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
