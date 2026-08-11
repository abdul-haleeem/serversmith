import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-black">
      <form
        onSubmit={handleSubmit}
        className="bg-prussian-blue p-8 rounded-lg flex flex-col gap-4 w-80 border border-dusk-blue/40"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70 focus:outline-none focus:ring-2 focus:ring-sky-mist"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70 focus:outline-none focus:ring-2 focus:ring-sky-mist"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-dusk-blue hover:brightness-110 text-white p-2 rounded transition"
        >
          Log In
        </button>

        <p className="text-sky-mist text-sm text-center">
          No account?{' '}
          <a href="/register" className="text-sky-mist underline hover:text-white">
            Register
          </a>
        </p>
      </form>
    </div>
  )
}

export default Login