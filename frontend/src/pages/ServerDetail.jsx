import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getServer,
  testConnection,
  executeCommand,
  getHistory,
  getMetrics,
  getMetricsHistory,
  getContainers,
  containerAction,
  getContainerLogs,
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
  const [containers, setContainers] = useState([])
  const [loadingContainers, setLoadingContainers] = useState(false)
  const [containerActionLoading, setContainerActionLoading] = useState(null)
  const [logs, setLogs] = useState(null)
  const [logsContainerName, setLogsContainerName] = useState(null)

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

  const handleLoadContainers = async () => {
    setLoadingContainers(true)
    try {
      const response = await getContainers(id)
      setContainers(response.data.containers || [])
    } catch (err) {
      setContainers([])
    }
    setLoadingContainers(false)
  }

  const handleContainerAction = async (containerName, action) => {
    setContainerActionLoading(containerName + action)
    try {
      await containerAction(id, containerName, action)
      await handleLoadContainers()
    } catch (err) {
      // no-op; list refresh already attempted above
    }
    setContainerActionLoading(null)
  }

  const handleViewLogs = async (containerName) => {
    setLogsContainerName(containerName)
    setLogs('Loading...')
    try {
      const response = await getContainerLogs(id, containerName)
      setLogs(response.data.logs || 'No logs available')
    } catch (err) {
      setLogs('Could not fetch logs')
    }
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

      {/* Docker Containers */}
      <div className="bg-prussian-blue p-4 rounded-lg mb-6 w-96 border border-dusk-blue/40">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white font-semibold">Docker Containers</h2>
          <button
            onClick={handleLoadContainers}
            disabled={loadingContainers}
            className="bg-dusk-blue hover:brightness-110 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition"
          >
            {loadingContainers ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {containers.length === 0 ? (
          <p className="text-sky-mist text-sm">
            No containers loaded yet — click Refresh.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {containers.map((container) => (
              <div key={container.id} className="bg-dusk-blue/30 p-2 rounded text-sm">
                <p className="text-white font-mono">{container.name}</p>
                <p className="text-sky-mist text-xs">{container.image}</p>
                <p className="text-sky-mist/70 text-xs">{container.status}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {['start', 'stop', 'restart'].map((action) => (
                    <button
                      key={action}
                      onClick={() => handleContainerAction(container.name, action)}
                      disabled={containerActionLoading === container.name + action}
                      className="bg-ink-black hover:brightness-125 text-white px-2 py-1 rounded text-xs disabled:opacity-50 transition"
                    >
                      {containerActionLoading === container.name + action ? '...' : action}
                    </button>
                  ))}
                  <button
                    onClick={() => handleViewLogs(container.name)}
                    className="bg-ink-black hover:brightness-125 text-white px-2 py-1 rounded text-xs transition"
                  >
                    logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {logsContainerName && (
          <div className="mt-3 pt-3 border-t border-dusk-blue/40">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sky-mist text-xs">Logs: {logsContainerName}</p>
              <button
                onClick={() => setLogsContainerName(null)}
                className="text-sky-mist text-xs hover:text-white"
              >
                close
              </button>
            </div>
            <pre className="text-white/80 text-xs whitespace-pre-wrap bg-ink-black p-2 rounded max-h-48 overflow-y-auto">
              {logs}
            </pre>
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