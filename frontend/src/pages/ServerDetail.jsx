import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getServer,
  testConnection,
  executeCommand,
  getHistory,
  getMetrics,
  getMetricsHistory,
} from '../services/servers'

function ServerDetail() {
  const { id } = useParams()
  const [server, setServer] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [command, setCommand] = useState('')
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [metricsHistory, setMetricsHistory] = useState([])
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const loadServer = async () => {
    const response = await getServer(id)
    setServer(response.data)
  }

  const loadHistory = async () => {
    const response = await getHistory(id)
    setHistory(response.data)
  }

  useEffect(() => {
    loadServer()
    loadHistory()
  }, [id])

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const response = await testConnection(id)
      setTestResult(response.data)
    } catch (err) {
      setTestResult({ success: false, message: 'Request failed' })
    }
    setTesting(false)
  }

  const handleRunCommand = async (e) => {
    e.preventDefault()
    if (!command.trim()) return
    setRunning(true)
    try {
      await executeCommand(id, command)
      setCommand('')
      loadHistory()
    } catch (err) {
      loadHistory()
    }
    setRunning(false)
  }

  const handleCheckMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const response = await getMetrics(id)
      setMetrics(response.data)
      const historyResponse = await getMetricsHistory(id)
      setMetricsHistory(historyResponse.data)
    } catch (err) {
      setMetrics(null)
    }
    setLoadingMetrics(false)
  }

  if (!server) {
    return <p className="text-sky-mist p-8">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-ink-black p-8">
      <Link to="/servers" className="text-sky-mist underline text-sm hover:text-white">
        &larr; Back to Servers
      </Link>

      <h1 className="text-3xl font-bold text-white mt-2 mb-1">{server.name}</h1>
      <p className="text-sky-mist mb-6">
        {server.ssh_username}@{server.ip_address}:{server.ssh_port}
      </p>

      {/* Test Connection */}
      <div className="bg-prussian-blue p-4 rounded-lg mb-6 w-96 border border-dusk-blue/40">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="bg-dusk-blue hover:brightness-110 text-white px-4 py-2 rounded disabled:opacity-50 transition"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {testResult && (
          <p className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResult.message}
          </p>
        )}
      </div>

      {/* Run Command */}
      <form
        onSubmit={handleRunCommand}
        className="bg-prussian-blue p-4 rounded-lg mb-6 w-96 flex flex-col gap-2 border border-dusk-blue/40"
      >
        <h2 className="text-white font-semibold">Run Command</h2>
        <input
          type="text"
          placeholder="e.g. whoami"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70 font-mono text-sm"
        />
        <button
          type="submit"
          disabled={running}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 transition"
        >
          {running ? 'Running...' : 'Run'}
        </button>
      </form>

      {/* Metrics */}
      <div className="bg-prussian-blue p-4 rounded-lg mb-6 w-96 border border-dusk-blue/40">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white font-semibold">Metrics</h2>
          <button
            onClick={handleCheckMetrics}
            disabled={loadingMetrics}
            className="bg-dusk-blue hover:brightness-110 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition"
          >
            {loadingMetrics ? 'Checking...' : 'Check Now'}
          </button>
        </div>

        {metrics && (
          <div className="text-sm text-sky-mist flex flex-col gap-1">
            <p>
              Memory: {metrics.memory?.used_mb}MB / {metrics.memory?.total_mb}MB (
              {metrics.memory?.percent}%)
            </p>
            <p>
              Disk: {metrics.disk?.used} / {metrics.disk?.total} ({metrics.disk?.percent})
            </p>
            <p>Uptime: {metrics.uptime}</p>
          </div>
        )}

        {metricsHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dusk-blue/40">
            <p className="text-sky-mist/70 text-xs mb-1">Recent checks:</p>
            {metricsHistory.slice(0, 5).map((entry) => (
              <p key={entry.id} className="text-sky-mist/60 text-xs">
                {new Date(entry.recorded_at).toLocaleTimeString()} — RAM {entry.memory_percent}%,
                Disk {entry.disk_percent}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Command History */}
      <div className="w-96">
        <h2 className="text-white font-semibold mb-2">Command History</h2>
        {history.length === 0 ? (
          <p className="text-sky-mist text-sm">No commands run yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((entry) => (
              <div key={entry.id} className="bg-prussian-blue p-3 rounded text-sm border border-dusk-blue/40">
                <p className="text-sky-mist font-mono">$ {entry.command}</p>
                {entry.output && (
                  <pre className="text-white/90 whitespace-pre-wrap mt-1">{entry.output}</pre>
                )}
                {entry.error && (
                  <pre className="text-red-400 whitespace-pre-wrap mt-1">{entry.error}</pre>
                )}
                <p className="text-sky-mist/60 text-xs mt-1">
                  exit code: {entry.exit_code ?? 'n/a'} —{' '}
                  {new Date(entry.executed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ServerDetail