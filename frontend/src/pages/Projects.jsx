import { useState, useEffect } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../services/projects'

function ProjectCard({ project, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [framework, setFramework] = useState(project.framework)
  const [repositoryUrl, setRepositoryUrl] = useState(project.repository_url)

  const handleSave = async (e) => {
    e.preventDefault()
    await updateProject(project.id, {
      name,
      framework,
      repository_url: repositoryUrl,
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
        className="bg-gray-800 p-4 rounded-lg flex flex-col gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
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
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-semibold">{project.name}</h3>
      <p className="text-gray-400 text-sm">
        {project.framework || 'No framework set'}
      </p>
      {project.repository_url && (
        <a href={project.repository_url} className="text-blue-400 text-sm underline">
          {project.repository_url}
        </a>
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
      await createProject({ name, framework, repository_url: repositoryUrl })
      setName('')
      setFramework('')
      setRepositoryUrl('')
      loadProjects()
    } catch (err) {
      setError('Could not create project. Check the fields and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Projects</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg flex flex-col gap-3 w-96 mb-8"
      >
        <h2 className="text-xl font-semibold text-white">New Project</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          placeholder="Framework (optional)"
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          placeholder="Repository URL (optional)"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Create
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400">No projects yet.</p>
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