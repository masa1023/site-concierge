'use client'

import { useState } from 'react'
import { StepIndicator } from '@/components/StepIndicator'
import { ScrapeSection } from '@/components/ScrapeSection'
import { IndexSection } from '@/components/IndexSection'

export default function Home() {
  const [scrapeCompleted, setScrapeCompleted] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)

  const steps = [
    { id: 'step-1', label: '1️⃣ Scrape Content', completed: scrapeCompleted, active: activeStep === 0 },
    { id: 'step-2', label: '2️⃣ Index Data', completed: activeStep === 2, active: activeStep === 1 },
    { id: 'step-3', label: '3️⃣ Deploy', completed: activeStep === 2, active: false },
  ]

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🤖 FlowAgent Admin</h1>
        <p className="text-slate-200 text-lg">Manage your chatbot's knowledge base</p>
      </div>

      {/* Content */}
      <div className="p-10">
        <StepIndicator steps={steps} />

        <ScrapeSection
          onSuccess={() => setScrapeCompleted(true)}
          onStepChange={setActiveStep}
        />

        <IndexSection
          disabled={!scrapeCompleted}
          onStepChange={setActiveStep}
        />
      </div>
    </div>
  )
}
