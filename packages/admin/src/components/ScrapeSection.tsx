'use client'

import { useState } from 'react'

interface ScrapeSectionProps {
  onSuccess: () => void
  onStepChange: (step: number) => void
}

type StatusType = 'idle' | 'loading' | 'success' | 'error'

export function ScrapeSection({ onSuccess, onStepChange }: ScrapeSectionProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<StatusType>('idle')
  const [message, setMessage] = useState('')

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setMessage('Please enter a valid URL')
      setStatus('error')
      return
    }

    setStatus('loading')
    onStepChange(0)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(
          `✅ Successfully scraped ${result.contentLength} characters from ${url}`
        )
        setStatus('success')
        onSuccess()
        onStepChange(-1)
      } else {
        throw new Error(result.error || 'Scraping failed')
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
      setStatus('error')
      onStepChange(-1)
    }
  }

  return (
    <div className="mb-10 p-8 border-2 border-slate-200 rounded-lg bg-slate-50">
      <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
        🔍 Website Content Extraction
      </h2>

      <form onSubmit={handleScrape} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="website-url"
            className="block font-semibold text-gray-700"
          >
            Website URL to scrape:
          </label>
          <input
            type="url"
            id="website-url"
            placeholder="https://your-website.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none transition-all"
        >
          {status === 'loading' ? (
            <>
              <span>🔄</span>
              Scraping...
            </>
          ) : (
            <>
              <span>🚀</span>
              Start Scraping
            </>
          )}
        </button>
      </form>

      {status !== 'idle' && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm font-medium ${
            status === 'loading'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
