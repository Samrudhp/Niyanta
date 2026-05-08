import { useState, useEffect } from 'react'

function DigestModal({ ingestionId, onClose }) {
  const [digest, setDigest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [daysBack, setDaysBack] = useState(7)

  useEffect(() => {
    generateDigest()
  }, [])

  const generateDigest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingestion_id: ingestionId,
          days_back: daysBack,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate digest')
      }

      const data = await response.json()
      setDigest(data)
    } catch (error) {
      console.error('Failed to generate digest:', error)
      alert('Failed to generate digest')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(digest, null, 2))
    alert('Digest copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-claude-surface border border-claude-border rounded-claude max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-claude-lg">
        <div className="sticky top-0 bg-claude-surface border-b border-claude-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-claude-text">Digest</h2>
          <button
            onClick={onClose}
            className="text-claude-text-secondary hover:text-claude-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-claude-border border-t-claude-accent rounded-full animate-spin mb-4"></div>
              <p className="text-claude-text-secondary">Generating digest...</p>
            </div>
          ) : digest ? (
            <div>
              <div className="mb-6 pb-6 border-b border-claude-border">
                <h3 className="text-lg font-semibold text-claude-text mb-1">
                  {digest.source_name}
                </h3>
                <p className="text-sm text-claude-text-secondary">{digest.period}</p>
              </div>

              {digest.sections && digest.sections.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-claude-text">Summary</h4>
                  {digest.sections.map((section, idx) => (
                    <div key={idx} className="bg-claude-code-bg rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-claude-text">{section.type}</h5>
                        <span className="text-sm text-claude-text-secondary">
                          {section.count} items
                        </span>
                      </div>
                      <p className="text-sm text-claude-text-secondary leading-relaxed">
                        {section.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {digest.stats && (
                <div className="bg-claude-code-bg rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-claude-text mb-3">Statistics</h4>
                  <div className="space-y-2 text-sm text-claude-text-secondary">
                    <div className="flex justify-between">
                      <span>Total documents:</span>
                      <span className="font-medium text-claude-text">
                        {digest.stats.total_docs}
                      </span>
                    </div>
                    {digest.stats.date_range && (
                      <div className="flex justify-between">
                        <span>Date range:</span>
                        <span className="font-medium text-claude-text">
                          {digest.stats.date_range}
                        </span>
                      </div>
                    )}
                    {digest.stats.top_authors && digest.stats.top_authors.length > 0 && (
                      <div>
                        <div className="mb-1">Top contributors:</div>
                        <div className="flex flex-wrap gap-2">
                          {digest.stats.top_authors.slice(0, 5).map((author, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-claude-surface border border-claude-border rounded text-xs"
                            >
                              {author.name} ({author.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-claude-code-bg hover:bg-claude-border text-claude-text rounded-lg font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-claude-text-secondary">Failed to generate digest</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DigestModal
