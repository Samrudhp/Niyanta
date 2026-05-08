import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-claude-bg to-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-7xl md:text-8xl font-bold text-claude-text mb-6 leading-tight">
              Transform Any Source Into
              <span className="block text-claude-accent mt-2">Searchable Knowledge</span>
            </h1>
            <p className="text-xl text-claude-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Ingest content from GitHub, webpages, PDFs, YouTube, Reddit, and RSS feeds. 
              Ask questions and get precise answers with citations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sources"
                className="px-8 py-4 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg font-medium text-lg transition-colors shadow-claude-lg"
              >
                Get Started
              </Link>
              <Link
                to="/chat"
                className="px-8 py-4 bg-white hover:bg-claude-code-bg text-claude-text border border-claude-border rounded-lg font-medium text-lg transition-colors shadow-claude"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-claude-text mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              A complete platform for knowledge ingestion, organization, and retrieval
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-claude-surface border border-claude-border rounded-claude p-8 shadow-claude hover:shadow-claude-lg transition-all h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-claude-accent to-claude-accent-hover rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                  Universal Ingestion
                </h3>
                <p className="text-claude-text-secondary leading-relaxed mb-4">
                  Support for GitHub repositories, documentation sites, PDFs, YouTube videos, Reddit discussions, and RSS feeds. One platform for all your knowledge sources.
                </p>
                <Link to="/sources" className="text-claude-accent hover:text-claude-accent-hover font-medium text-sm inline-flex items-center gap-1">
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-claude-surface border border-claude-border rounded-claude p-8 shadow-claude hover:shadow-claude-lg transition-all h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-claude-accent to-claude-accent-hover rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                  Cited Answers
                </h3>
                <p className="text-claude-text-secondary leading-relaxed mb-4">
                  Every answer includes precise citations linking to source documents. See exactly where information comes from with issue numbers, page references, and timestamps.
                </p>
                <Link to="/chat" className="text-claude-accent hover:text-claude-accent-hover font-medium text-sm inline-flex items-center gap-1">
                  Try it now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-claude-surface border border-claude-border rounded-claude p-8 shadow-claude hover:shadow-claude-lg transition-all h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-claude-accent to-claude-accent-hover rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                  Smart Digests
                </h3>
                <p className="text-claude-text-secondary leading-relaxed mb-4">
                  Automatically summarize what happened in your sources. Get insights on issues, pull requests, commits, and discussions over any time period.
                </p>
                <Link to="/sources" className="text-claude-accent hover:text-claude-accent-hover font-medium text-sm inline-flex items-center gap-1">
                  See example
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-claude-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-claude-text mb-4">
              How It Works
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Three simple steps to transform your content into searchable knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-claude-accent text-white rounded-full text-2xl font-semibold mb-6">
                1
              </div>
              <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                Add Your Source
              </h3>
              <p className="text-claude-text-secondary leading-relaxed">
                Paste a URL or upload a PDF. We automatically detect the type and start processing.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-claude-accent text-white rounded-full text-2xl font-semibold mb-6">
                2
              </div>
              <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                Watch It Process
              </h3>
              <p className="text-claude-text-secondary leading-relaxed">
                Real-time progress updates as we extract, chunk, and index your content into our knowledge base.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-claude-accent text-white rounded-full text-2xl font-semibold mb-6">
                3
              </div>
              <h3 className="font-heading text-3xl font-bold text-claude-text mb-3">
                Ask Questions
              </h3>
              <p className="text-claude-text-secondary leading-relaxed">
                Get instant answers with citations. Filter by source, generate digests, and explore your knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Sources */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-claude-text mb-4">
              Supported Sources
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Ingest content from your favorite platforms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div className="text-sm font-medium text-claude-text">GitHub</div>
            </div>

            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div className="text-sm font-medium text-claude-text">Webpages</div>
            </div>

            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="text-sm font-medium text-claude-text">PDFs</div>
            </div>

            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <div className="text-sm font-medium text-claude-text">YouTube</div>
            </div>

            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              <div className="text-sm font-medium text-claude-text">Reddit</div>
            </div>

            <div className="bg-claude-surface border border-claude-border rounded-claude p-6 text-center hover:shadow-claude transition-all">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
              </svg>
              <div className="text-sm font-medium text-claude-text">RSS Feeds</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-claude-accent to-claude-accent-hover">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Transform your content into searchable knowledge in minutes
          </p>
          <Link
            to="/sources"
            className="inline-block px-8 py-4 bg-white hover:bg-claude-bg text-claude-accent rounded-lg font-medium text-lg transition-colors shadow-claude-lg"
          >
            Add Your First Source
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
