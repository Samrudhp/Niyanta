import { Outlet, Link, useLocation } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-claude-surface border-b border-claude-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">N</span>
                </div>
                <span className="font-heading text-3xl font-bold text-claude-text">Niyanta</span>
              </Link>
              
              <nav className="flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-claude-code-bg text-claude-text'
                      : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-code-bg'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/sources"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/sources')
                      ? 'bg-claude-code-bg text-claude-text'
                      : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-code-bg'
                  }`}
                >
                  Sources
                </Link>
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-claude-code-bg text-claude-text'
                      : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-code-bg'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  to="/graph"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/graph')
                      ? 'bg-claude-code-bg text-claude-text'
                      : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-code-bg'
                  }`}
                >
                  Graph
                </Link>
              </nav>
            </div>
            
            <div className="text-sm text-claude-text-secondary">
              Knowledge Ingestion & Q&A
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-claude-surface border-t border-claude-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-claude-text-secondary">
            <div>Powered by Agentic RAG</div>
            <div>© 2026 Niyanta</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
