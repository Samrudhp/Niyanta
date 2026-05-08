import { useState, useEffect } from 'react'
import SourceCard from '../components/SourceCard'
import DigestModal from '../components/DigestModal'

function SourcesPage() {
  const [url, setUrl] = useState('')
  const [recursive, setRecursive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sources, setSources] = useState([])
  const [digestModal, setDigestModal] = useState(null)

  useEffect(() => {
    fetchSources()
    const interval = setInterval(fetchSources, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/ingest/list')
      if (response.ok) {
        const data = await response.json()
        setSources(data.ingestions)
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, recursive }),
      })

      if (!response.ok) {
        throw new Error('Failed to start ingestion')
      }

      setUrl('')
      setRecursive(false)
      fetchSources()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ingest/pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload PDF')
      }

      fetchSources()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (ingestionId) => {
    if (!confirm('Are you sure you want to delete this source?')) return

    try {
      const response = await fetch(`/api/ingest/${ingestionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSources()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-5xl font-bold text-claude-text mb-2">
          Manage Sources
        </h1>
        <p className="text-claude-text-secondary">
          Add new sources or manage existing ones
        </p>
      </div>

      {/* Add New Source */}
      <div className="bg-claude-surface border border-claude-border rounded-claude p-6 shadow-claude mb-8">
        <h2 className="font-heading text-3xl font-bold text-claude-text mb-4">
          Add New Source
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-claude-text mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/expressjs/express"
              className="w-full px-4 py-3 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder-claude-text-tertiary focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent transition-all"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-claude-text-secondary">
              Supports: GitHub repos, webpages, YouTube videos, Reddit threads, RSS feeds
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="recursive"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="w-4 h-4 text-claude-accent border-claude-border rounded focus:ring-claude-accent"
            />
            <label htmlFor="recursive" className="text-sm text-claude-text-secondary">
              Recursive crawl (for documentation sites, max 20 pages)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting Ingestion...' : 'Ingest Source'}
          </button>
        </form>

        <div className="border-t border-claude-border pt-6">
          <label className="block text-sm font-medium text-claude-text mb-2">
            Or upload a PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-claude-text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border file:border-claude-border
              file:text-sm file:font-medium
              file:bg-claude-code-bg file:text-claude-text
              hover:file:bg-claude-border
              file:cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Sources List */}
      <div>
        <h2 className="font-heading text-3xl font-bold text-claude-text mb-4">
          Your Sources ({sources.length})
        </h2>

        {sources.length === 0 ? (
          <div className="bg-claude-surface border border-claude-border rounded-claude p-12 text-center shadow-claude">
            <div className="w-16 h-16 bg-claude-code-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-claude-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-claude-text-secondary">
              No sources yet. Add your first source above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sources.map((source) => (
              <SourceCard
                key={source.ingestion_id}
                source={source}
                onDelete={handleDelete}
                onDigest={(id) => setDigestModal(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Digest Modal */}
      {digestModal && (
        <DigestModal
          ingestionId={digestModal}
          onClose={() => setDigestModal(null)}
        />
      )}
    </div>
  )
}

export default SourcesPage
