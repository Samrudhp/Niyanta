import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SourceFilter from '../components/SourceFilter'

function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceFilter, setSourceFilter] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          use_cache: true,
          force_agentic: false,
          source_filter: sourceFilter,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        metadata: data.metadata || {},
        confidence: data.confidence,
        pipeline: data.pipeline,
        cache_hit: data.cache_hit,
        processing_time_ms: data.processing_time_ms,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        error: true,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-claude-border bg-claude-surface">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-heading text-4xl font-bold text-claude-text">
            Chat
          </h1>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm text-claude-text-secondary hover:text-claude-text hover:bg-claude-code-bg rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>
        <SourceFilter
          selectedSource={sourceFilter}
          onSourceChange={setSourceFilter}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-claude-code-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-claude-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-heading text-3xl font-bold text-claude-text mb-2">
                Start a Conversation
              </h3>
              <p className="text-claude-text-secondary">
                Ask questions about your ingested sources. I'll provide answers with citations.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-3xl bg-claude-code-bg rounded-claude p-4">
                      <div className="text-claude-text">{message.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-3xl">
                      <div className={`rounded-claude p-4 ${
                        message.error
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-claude-surface border border-claude-border shadow-claude'
                      }`}>
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Metadata */}
                        {!message.error && message.metadata && (
                          <div className="mt-4 pt-4 border-t border-claude-border">
                            <div className="flex flex-wrap gap-4 text-xs text-claude-text-secondary">
                              {message.pipeline && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Pipeline:</span>
                                  <span>{message.pipeline}</span>
                                </div>
                              )}
                              {message.confidence !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Confidence:</span>
                                  <span>{(message.confidence * 100).toFixed(0)}%</span>
                                </div>
                              )}
                              {message.cache_hit !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Cache:</span>
                                  <span>{message.cache_hit ? 'Hit' : 'Miss'}</span>
                                </div>
                              )}
                              {message.processing_time_ms && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Time:</span>
                                  <span>{message.processing_time_ms.toFixed(0)}ms</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sources */}
                        {!message.error && message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-claude-border">
                            <div className="text-sm font-medium text-claude-text mb-3">
                              Sources ({message.sources.length})
                            </div>
                            <div className="space-y-2">
                              {message.sources.slice(0, 5).map((source, idx) => (
                                <div
                                  key={idx}
                                  className="bg-claude-code-bg rounded-lg p-3 text-sm"
                                >
                                  {source.source_url && source.source_id && (
                                    <div className="mb-2">
                                      <a
                                        href={source.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-claude-accent hover:text-claude-accent-hover font-medium"
                                      >
                                        {source.source_id}
                                      </a>
                                    </div>
                                  )}
                                  <div className="text-claude-text-secondary line-clamp-2">
                                    {source.content}
                                  </div>
                                  {(source.source_type || source.similarity !== undefined) && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {source.source_type && (
                                        <span className="px-2 py-0.5 bg-claude-surface border border-claude-border rounded text-xs text-claude-text-secondary">
                                          {source.source_type}
                                        </span>
                                      )}
                                      {source.similarity !== undefined && (
                                        <span className="px-2 py-0.5 bg-claude-surface border border-claude-border rounded text-xs text-claude-text-secondary">
                                          {(source.similarity * 100).toFixed(0)}% match
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-3xl bg-claude-surface border border-claude-border rounded-claude p-4 shadow-claude">
                  <div className="flex items-center gap-2 text-claude-text-secondary">
                    <div className="w-2 h-2 bg-claude-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-claude-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-claude-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-claude-border bg-claude-surface">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your sources..."
            className="flex-1 px-4 py-3 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder-claude-text-tertiary focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
