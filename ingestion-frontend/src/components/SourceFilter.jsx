import { useState, useEffect } from 'react'

function SourceFilter({ selectedSource, onSourceChange }) {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/ingest/list')
      if (response.ok) {
        const data = await response.json()
        const completedSources = data.ingestions.filter(
          (ing) => ing.status === 'complete'
        )
        setSources(completedSources)
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-claude-text-secondary">
        Loading sources...
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-claude-text mb-2">
        Filter by Source
      </label>
      <select
        value={selectedSource || 'all'}
        onChange={(e) => onSourceChange(e.target.value === 'all' ? null : e.target.value)}
        className="w-full px-4 py-2 bg-claude-bg border border-claude-border rounded-lg text-claude-text focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent transition-all"
      >
        <option value="all">All Sources</option>
        {sources.map((source) => (
          <option key={source.ingestion_id} value={source.ingestion_id}>
            {source.source_name} ({source.total_docs} docs)
          </option>
        ))}
      </select>
      {sources.length === 0 && (
        <p className="mt-2 text-sm text-claude-text-secondary">
          No sources available. Add sources first.
        </p>
      )}
    </div>
  )
}

export default SourceFilter
