'use client'

interface StepIndicatorProps {
  steps: Array<{ id: string; label: string; completed: boolean; active: boolean }>
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              step.completed
                ? 'bg-green-100 text-green-700'
                : step.active
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <div className="text-gray-400 text-lg">→</div>
          )}
        </div>
      ))}
    </div>
  )
}
