import { useState, useEffect } from 'react'
import { getDeployments, createDeployment } from '../services/deployments'
import { getProjects } from '../services/projects'
import { getServers } from '../services/servers'

const STATUS_COLORS = {
  PENDING: 'text-sky-mist',
  RUNNING: 'text-yellow-400',
  SUCCESS: 'text-green-400',
  FAILED: 'text-red-400',
}

function Deployments() {
  const [deployments, setDeployments] = useState([])
  const [projects, setProjects] = useState([])
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')

  const [projectId, setProjectId] = useState('')
  const [serverId, setServerId] = useState('')
  const [version, setVersion] = useState('')

  const loadAll = async () => {
    const [deploymentsRes, projectsRes, serversRes] = await Promise.all([
      getDeployments(),
      getProjects(),
      getServers(),
    ])
    setDeployments(deploymentsRes.data)
    setProjects(projectsRes.data)
    setServers(serversRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleDeploy = async (e) => {
    e.preventDefault()
    setError('')
    if (!projectId || !serverId) {
      setError('Choose a project and a server.')
      return
    }
    setDeploying(true)
    try {
      await createDeployment({ project: projectId, server: serverId, version })
      setVersion('')
      loadAll()
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Deployment failed to start.')
    }
    setDeploying(false)
  }

  return (
    <div className="min-h-screen bg-ink-black p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Deployments</h1>

      <form
        onSubmit={handleDeploy}
        className="bg-prussian-blue p-6 rounded-lg flex flex-col gap-3 w-96 mb-8 border border-dusk-blue/40"
      >
        <h2 className="text-xl font-semibold text-white">New Deployment</h2>

        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
        >
          <option value="">Select a server</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Version (optional)"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={deploying}
          className="bg-dusk-blue hover:brightness-110 text-white p-2 rounded disabled:opacity-50 transition"
        >
          {deploying ? 'Deploying... (this waits for it to finish)' : 'Deploy'}
        </button>
      </form>

      {loading ? (
        <p className="text-sky-mist">Loading deployments...</p>
      ) : deployments.length === 0 ? (
        <p className="text-sky-mist">No deployments yet.</p>
      ) : (
        <div className="flex flex-col gap-3 w-96">
          {deployments.map((d) => (
            <div key={d.id} className="bg-prussian-blue p-4 rounded-lg border border-dusk-blue/40">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">
                  {d.project_name} &rarr; {d.server_name}
                </p>
                <span className={`font-mono text-xs uppercase ${STATUS_COLORS[d.status]}`}>
                  {d.status}
                </span>
              </div>
              <p className="text-sky-mist text-xs mt-1">
                {d.version && `${d.version} — `}
                started {new Date(d.started_at).toLocaleString()}
                {d.finished_at && ` — finished ${new Date(d.finished_at).toLocaleString()}`}
              </p>
              {d.logs && (
                <pre className="text-white/80 text-xs whitespace-pre-wrap bg-ink-black p-2 rounded mt-2 max-h-48 overflow-y-auto">
                  {d.logs}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Deployments