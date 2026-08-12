import { useState, useEffect } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../services/projects'

function ProjectCard({ project, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [framework, setFramework] = useState(project.framework)
  const [repositoryUrl, setRepositoryUrl] = useState(project.repository_url)
  const [port, setPort] = useState(project.port)

  const handleSave = async (e) => {
    e.preventDefault()
    await updateProject(project.id, {
      name,
      framework,
      repository_url: repositoryUrl,
      port,
    })
    setIsEditing(false)
    onUpdated()
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete "${project.name}"?`)) {
      await deleteProject(project.id)
      onDeleted()
    }
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-prussian-blue p-4 rounded-lg flex flex-col gap-2 border border-dusk-blue/40"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
          placeholder="Name"
        />
        <input
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
          placeholder="Framework"
        />
        <input
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
          placeholder="Repository URL"
        />
        <input
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white"
          placeholder="App Port"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-dusk-blue hover:brightness-110 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-prussian-blue p-4 rounded-lg border border-dusk-blue/40">
      <h3 className="text-white font-semibold">{project.name}</h3>
      <p className="text-sky-mist text-sm">
        {project.framework || 'No framework set'} — port {project.port}
      </p>
      {project.repository_url && (
        <a href={project.repository_url} className="text-sky-mist text-sm underline hover:text-white">
          {project.repository_url}
        </a>
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-dusk-blue hover:brightness-110 text-white px-3 py-1 rounded text-sm transition"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [framework, setFramework] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [port, setPort] = useState('3000')
  const [error, setError] = useState('')

  const loadProjects = async () => {
    const response = await getProjects()
    setProjects(response.data)
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createProject({
        name,
        framework,
        repository_url: repositoryUrl,
        port,
      })
      setName('')
      setFramework('')
      setRepositoryUrl('')
      setPort('3000')
      loadProjects()
    } catch (err) {
      setError('Could not create project. Check the fields and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ink-black p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Projects</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-prussian-blue p-6 rounded-lg flex flex-col gap-3 w-96 mb-8 border border-dusk-blue/40"
      >
        <h2 className="text-xl font-semibold text-white">New Project</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70"
        />
        <input
          type="text"
          placeholder="Framework (optional)"
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70"
        />
        <input
          type="text"
          placeholder="Repository URL (must have a Dockerfile)"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70"
        />
        <input
          type="number"
          placeholder="App Port (e.g. 3000, 8000)"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="p-2 rounded bg-dusk-blue text-white placeholder-sky-mist/70"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-dusk-blue hover:brightness-110 text-white p-2 rounded transition"
        >
          Create
        </button>
      </form>

      {loading ? (
        <p className="text-sky-mist">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-sky-mist">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3 w-96">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdated={loadProjects}
              onDeleted={loadProjects}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects