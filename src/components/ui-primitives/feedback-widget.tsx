'use client'

import * as React from 'react'
import { Star, Send, ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FeedbackWidgetProps {
  // Where the feedback is stored (localStorage key)
  storageKey?: string
  // Context for the feedback (e.g., which page this is on)
  context?: string
  // Position: floating or inline
  variant?: 'floating' | 'inline'
}

interface FeedbackEntry {
  id: string
  rating: number  // 1-5 stars
  type: 'positive' | 'negative' | 'suggestion'
  message: string
  context: string
  timestamp: string
}

const STORAGE_KEY = 'meridian-feedback'

export function FeedbackWidget({
  storageKey = STORAGE_KEY,
  context = 'general',
  variant = 'floating',
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [feedbackType, setFeedbackType] = React.useState<'positive' | 'negative' | 'suggestion'>('positive')
  const [message, setMessage] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [previousFeedback, setPreviousFeedback] = React.useState<FeedbackEntry[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setPreviousFeedback(JSON.parse(raw))
    } catch {}
  }, [storageKey])

  const handleSubmit = () => {
    if (rating === 0 && !message.trim()) return

    const entry: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      rating,
      type: feedbackType,
      message: message.trim(),
      context,
      timestamp: new Date().toISOString(),
    }

    const updated = [entry, ...previousFeedback].slice(0, 50)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {}
    setPreviousFeedback(updated)
    setSubmitted(true)

    // Reset after 2s
    setTimeout(() => {
      setSubmitted(false)
      setIsOpen(false)
      setRating(0)
      setMessage('')
    }, 2000)
  }

  if (variant === 'floating') {
    return (
      <>
        {/* Floating button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform text-xs font-medium"
            aria-label="Give feedback"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </button>
        )}

        {/* Feedback panel */}
        {isOpen && (
          <div className="fixed bottom-4 left-4 z-50 w-80">
            <Card className="shadow-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Send Feedback</span>
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {submitted ? (
                  <div className="text-center py-4">
                    <ThumbsUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-sm font-medium">Thank you!</p>
                    <p className="text-xs text-muted-foreground">Your feedback was saved locally.</p>
                  </div>
                ) : (
                  <>
                    {/* Type selector */}
                    <div className="flex gap-1.5">
                      <FeedbackTypeButton type="positive" active={feedbackType === 'positive'} onClick={() => setFeedbackType('positive')} icon={ThumbsUp} label="Good" />
                      <FeedbackTypeButton type="negative" active={feedbackType === 'negative'} onClick={() => setFeedbackType('negative')} icon={ThumbsDown} label="Issue" />
                      <FeedbackTypeButton type="suggestion" active={feedbackType === 'suggestion'} onClick={() => setFeedbackType('suggestion')} icon={MessageSquare} label="Idea" />
                    </div>

                    {/* Star rating */}
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Rating</div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5"
                          >
                            <Star
                              className={cn(
                                'h-4 w-4 transition-colors',
                                star <= (hoverRating || rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/40'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="text-xs min-h-[60px]"
                      />
                    </div>

                    <Button size="sm" className="w-full" onClick={handleSubmit} disabled={rating === 0 && !message.trim()}>
                      <Send className="h-3 w-3 mr-1" /> Submit
                    </Button>

                    {previousFeedback.length > 0 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        {previousFeedback.length} feedback {previousFeedback.length === 1 ? 'entry' : 'entries'} saved
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

  // Inline variant
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Feedback</span>
          <Badge variant="outline" className="text-[9px]">{context}</Badge>
        </div>
        {submitted ? (
          <div className="text-center py-2">
            <ThumbsUp className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs">Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            <div className="flex gap-1.5">
              <FeedbackTypeButton type="positive" active={feedbackType === 'positive'} onClick={() => setFeedbackType('positive')} icon={ThumbsUp} label="Good" />
              <FeedbackTypeButton type="negative" active={feedbackType === 'negative'} onClick={() => setFeedbackType('negative')} icon={ThumbsDown} label="Issue" />
              <FeedbackTypeButton type="suggestion" active={feedbackType === 'suggestion'} onClick={() => setFeedbackType('suggestion')} icon={MessageSquare} label="Idea" />
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                  <Star className={cn('h-5 w-5 transition-colors', star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')} />
                </button>
              ))}
            </div>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what you think..." className="text-sm min-h-[80px]" />
            <Button size="sm" onClick={handleSubmit} disabled={rating === 0 && !message.trim()}>
              <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Feedback
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function FeedbackTypeButton({ type, active, onClick, icon: Icon, label }: {
  type: string
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  const colors: Record<string, string> = {
    positive: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
    negative: 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/20',
    suggestion: 'border-sky-500 text-sky-700 bg-sky-50 dark:bg-sky-950/20',
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md border text-[10px] font-medium transition-colors',
        active ? colors[type] : 'border-border text-muted-foreground hover:bg-accent/40'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
