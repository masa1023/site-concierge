'use client'

import { useState } from 'react'

interface IndexSectionProps {
  disabled: boolean
  onStepChange: (step: number) => void
}

type StatusType = 'idle' | 'loading' | 'success' | 'error'

export function IndexSection({ disabled, onStepChange }: IndexSectionProps) {
  const [status, setStatus] = useState<StatusType>('idle')
  const [message, setMessage] = useState('')

  const handleIndex = async () => {
    setStatus('loading')
    onStepChange(1)

    try {
      const response = await fetch('/api/index', {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(
          `✅ Successfully indexed ${result.chunksCount} content chunks`
        )
        setStatus('success')
        onStepChange(2)
      } else {
        throw new Error(result.error || 'Indexing failed')
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
      setStatus('error')
      onStepChange(-1)
    }
  }

  return (
    <div className="mb-10 p-8 border-2 border-slate-200 rounded-lg bg-slate-50">
      <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
        🗄️ Data Indexing
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Index the scraped content into Weaviate for search functionality.
      </p>

      <button
        onClick={handleIndex}
        disabled={disabled || status === 'loading'}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none transition-all"
      >
        {status === 'loading' ? (
          <>
            <span>🔄</span>
            Indexing...
          </>
        ) : (
          <>
            <span>⚡</span>
            Start Indexing
          </>
        )}
      </button>

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
