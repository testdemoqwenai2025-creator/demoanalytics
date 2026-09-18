'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, X, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStep {
  title: string
  description: string
  route?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to MERIDIAN',
    description: 'A hyperscale data analyst template with 22 routes, 18 data connectors, and an auto-generated narrative engine. This 4-step tour will show you the highlights.',
  },
  {
    title: 'The Dashboard',
    description: '9 sections of synthetic tick-lakehouse analytics: pipelines, datasets, ML models, alerts, governance, and incidents. All data is synthetic for the public preview.',
    route: '/dashboard',
  },
  {
    title: 'Data Stories',
    description: 'The first dashboard that explains itself. It reads the data and writes a plain-English narrative brief. No LLM needed — pure statistical pattern detection. Try switching between Executive, Analyst, and Compliance voices.',
    route: '/stories',
  },
  {
    title: 'Explore everything',
    description: '18 data connectors on /connectors. Live market data on /markets. Ask questions in plain English on /ask. Press ? anytime for keyboard shortcuts. Enjoy!',
    route: '/markets',
  },
]

const STORAGE_KEY = 'meridian-onboarding-completed'

export function OnboardingTour() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed && window.location.pathname === '/') {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    const nextStep = step + 1
    if (nextStep < TOUR_STEPS.length) {
      const tourStep = TOUR_STEPS[nextStep]
      if (tourStep.route) router.push(tourStep.route)
      setStep(nextStep)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = step - 1
      const tourStep = TOUR_STEPS[prevStep]
      if (tourStep.route) router.push(tourStep.route)
      setStep(prevStep)
    }
  }

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
    router.push('/')
  }

  if (!show) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={handleSkip}>
      <div
        className="bg-background rounded-lg border shadow-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Skip tour"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 mb-4">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center py-2">
            <div className="mx-auto w-fit rounded-full bg-primary/10 p-3 mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
        <h2 className="text-lg font-semibold mb-2">{currentStep.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{currentStep.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Step {step + 1} of {TOUR_STEPS.length}</div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button size="sm" variant="ghost" onClick={handlePrev}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleSkip}>Skip</Button>
            <Button size="sm" onClick={handleNext}>
              {isLast ? (
                <><Check className="h-3.5 w-3.5 mr-1" /> Get started</>
              ) : (
                <>Next <ArrowRight className="h-3.5 w-3.5 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
