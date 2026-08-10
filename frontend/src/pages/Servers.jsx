import { useState, useEffect } from 'react'
import { getServers, createServer, updateServer, deleteServer } from '../services/servers'

function ServerCard({ server, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(server.name)
  const [ipAddress, setIpAddress] = useState(server.ip_address)
  const [sshPort, setSshPort] = useState(server.ssh_port)
  const [sshUsername, setSshUsername] = useState(server.ssh_username)
  const [operatingSystem, setOperatingSystem] = useState(server.operating_system)

  const handleSave = async (e) => {
    e.preventDefault()
    await updateServer(server.id, {
      name,
      ip_address: ipAddress,
      ssh_port: sshPort,
      ssh_username: sshUsername,
      operating_system: operatingSystem,
    })
    setIsEditing(false)
    onUpdated()
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete "${server.name}"?`)) {
      await deleteServer(server.id)
      onDeleted()
    }
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-gray-800 p-4 rounded-lg flex flex-col gap-2"
      >
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" placeholder="Name" />
        <input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" placeholder="IP Address" />
        <input value={sshPort} onChange={(e) => setSshPort(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" placeholder="SSH Port" />
        <input value={sshUsername} onChange={(e) => setSshUsername(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" placeholder="SSH Username" />
        <input value={operatingSystem} onChange={(e) => setOperatingSystem(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" placeholder="OS" />
        <p className="text-gray-500 text-xs">
          Password is not editable here — leave blank means unchanged.
        </p>
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
            Save
          </button>
          <button type="button" onClick={() => setIsEditing(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-semibold">{server.name}</h3>
      <p className="text-gray-400 text-sm">
        {server.ssh_username}@{server.ip_address}:{server.ssh_port}
      </p>
      <p className="text-gray-500 text-xs">
        {server.operating_system || 'OS not set'}
      </p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
          Edit
        </button>
        <button onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
          Delete
        </button>
      </div>
    </div>
  )
}

function Servers() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [sshPort, setSshPort] = useState('22')
  const [sshUsername, setSshUsername] = useState('')
  const [sshPassword, setSshPassword] = useState('')
  const [error, setError] = useState('')

  const loadServers = async () => {
    const response = await getServers()
    setServers(response.data)
    setLoading(false)
  }

  useEffect(() => {
    loadServers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createServer({
        name,
        ip_address: ipAddress,
        ssh_port: sshPort,
        ssh_username: sshUsername,
        ssh_password: sshPassword,
      })
      setName('')
      setIpAddress('')
      setSshPort('22')
      setSshUsername('')
      setSshPassword('')
      loadServers()
    } catch (err) {
      setError('Could not add server. Check the fields and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Servers</h1>

      <form onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg flex flex-col gap-3 w-96 mb-8">
        <h2 className="text-xl font-semibold text-white">Add Server</h2>
        <input type="text" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" />
        <input type="text" placeholder="IP Address" value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" />
        <input type="number" placeholder="SSH Port" value={sshPort}
          onChange={(e) => setSshPort(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" />
        <input type="text" placeholder="SSH Username" value={sshUsername}
          onChange={(e) => setSshUsername(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" />
        <input type="password" placeholder="SSH Password" value={sshPassword}
          onChange={(e) => setSshPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
          Add Server
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Loading servers...</p>
      ) : servers.length === 0 ? (
        <p className="text-gray-400">No servers yet.</p>
      ) : (
        <div className="flex flex-col gap-3 w-96">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onUpdated={loadServers}
              onDeleted={loadServers}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Servers