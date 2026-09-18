'use client'

import * as React from 'react'
import {
  Mail, Webhook, Bell, Send, Trash2, Plus, MessageSquare, Check, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeading, EmptyState } from '@/components/dashboard/primitives'
import { useDashboardStore } from '@/lib/store'
import { toast } from 'sonner'

interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'discord' | 'webhook'
  label: string
  target: string  // email address or webhook URL
  enabled: boolean
  events: string[]  // which events trigger this channel
}

interface NotificationLog {
  id: string
  timestamp: string
  channel: string
  event: string
  message: string
  status: 'sent' | 'failed' | 'pending'
}

const STORAGE_KEY = 'meridian-notification-channels'
const LOG_KEY = 'meridian-notification-log'

function loadChannels(): NotificationChannel[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveChannels(channels: NotificationChannel[]) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(channels)) } catch {}
}

function loadLog(): NotificationLog[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLog(log: NotificationLog[]) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-50))) } catch {}
}

const EVENT_TYPES = [
  { id: 'alert.firing', label: 'Alert fires' },
  { id: 'alert.critical', label: 'Critical alert' },
  { id: 'slo.breach', label: 'SLO budget breach' },
  { id: 'incident.new', label: 'New incident' },
  { id: 'incident.resolved', label: 'Incident resolved' },
  { id: 'ml.drift', label: 'ML model drift detected' },
  { id: 'pipeline.degraded', label: 'Pipeline degraded' },
  { id: 'daily.summary', label: 'Daily summary' },
]

export function NotificationsPage() {
  const [channels, setChannels] = React.useState<NotificationChannel[]>(loadChannels)
  const [log, setLog] = React.useState<NotificationLog[]>(loadLog)
  const [newChannel, setNewChannel] = React.useState({
    type: 'email' as NotificationChannel['type'],
    label: '',
    target: '',
  })

  const apiKeys = useDashboardStore(s => s.apiKeys)

  React.useEffect(() => { saveChannels(channels) }, [channels])
  React.useEffect(() => { saveLog(log) }, [log])

  const addChannel = () => {
    if (!newChannel.label || !newChannel.target) {
      toast.error('Label and target are required')
      return
    }
    const channel: NotificationChannel = {
      id: `ch-${Date.now()}`,
      type: newChannel.type,
      label: newChannel.label,
      target: newChannel.target,
      enabled: true,
      events: ['alert.critical', 'slo.breach'],
    }
    setChannels(prev => [...prev, channel])
    setNewChannel({ type: 'email', label: '', target: '' })
    toast.success('Notification channel added')
  }

  const removeChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id))
    toast.success('Channel removed')
  }

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  const testChannel = async (channel: NotificationChannel) => {
    toast.info(`Testing ${channel.type} channel...`)

    // Log the test
    const entry: NotificationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel: channel.label,
      event: 'test',
      message: `Test notification to ${channel.target}`,
      status: 'sent',
    }
    setLog(prev => [entry, ...prev])

    // Simulate sending (in production, this would call /api/notifications/send)
    await new Promise(r => setTimeout(r, 500))

    if (channel.type === 'email') {
      toast.success('Test email "sent"', {
        description: `To: ${channel.target}. In production, this would use Resend API (100 emails/day free).`,
      })
    } else if (channel.type === 'slack' || channel.type === 'discord') {
      toast.success(`Test message sent to ${channel.type}`, {
        description: `Webhook: ${channel.target.slice(0, 50)}...`,
      })
    } else {
      toast.success('Test webhook fired', {
        description: `POST to ${channel.target.slice(0, 50)}...`,
      })
    }
  }

  const toggleEvent = (channelId: string, eventId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id !== channelId) return c
      const events = c.events.includes(eventId)
        ? c.events.filter(e => e !== eventId)
        : [...c.events, eventId]
      return { ...c, events }
    }))
  }

  return (
    <>
      <SectionHeading
        title="Notifications"
        description="Configure email, Slack, Discord, and webhook notifications for dashboard events. All configuration is client-side."
      />

      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels"><Bell className="h-3.5 w-3.5 mr-1.5" /> Channels</TabsTrigger>
          <TabsTrigger value="log"><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Log ({log.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4 space-y-4">
          {/* Add new channel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Notification Channel
              </CardTitle>
              <CardDescription className="text-xs">
                Email uses Resend (free 100/day). Slack/Discord use incoming webhooks (free, unlimited).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newChannel.type} onValueChange={(v: any) => setNewChannel(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email (Resend)</SelectItem>
                    <SelectItem value="slack">💬 Slack Webhook</SelectItem>
                    <SelectItem value="discord">🎮 Discord Webhook</SelectItem>
                    <SelectItem value="webhook">🔗 Generic Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input placeholder="e.g., On-call team" value={newChannel.label}
                  onChange={e => setNewChannel(p => ({ ...p, label: e.target.value }))} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">
                  {newChannel.type === 'email' ? 'Email address' :
                   newChannel.type === 'slack' ? 'Slack webhook URL' :
                   newChannel.type === 'discord' ? 'Discord webhook URL' : 'Webhook URL'}
                </Label>
                <Input
                  placeholder={newChannel.type === 'email' ? 'oncall@example.com' : 'https://hooks.slack.com/...'}
                  value={newChannel.target}
                  onChange={e => setNewChannel(p => ({ ...p, target: e.target.value }))}
                  className="mt-1 h-9" />
              </div>
              <Button onClick={addChannel}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
            </CardContent>
          </Card>

          {/* Existing channels */}
          {channels.length === 0 ? (
            <Card><CardContent className="p-8">
              <EmptyState title="No notification channels" description="Add a channel above to receive alerts via email, Slack, Discord, or webhook." />
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {channels.map(channel => (
                <Card key={channel.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <ChannelIcon type={channel.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{channel.label}</span>
                            <Badge variant="outline" className="text-[9px]">{channel.type}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate mt-0.5">{channel.target}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => testChannel(channel)}>
                          <Send className="h-3 w-3 mr-1" /> Test
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeChannel(channel.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Event subscriptions */}
                    <div className="border-t pt-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Events</div>
                      <div className="flex flex-wrap gap-1.5">
                        {EVENT_TYPES.map(event => (
                          <button
                            key={event.id}
                            onClick={() => toggleEvent(channel.id, event.id)}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              channel.events.includes(event.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {channel.events.includes(event.id) && <Check className="h-2.5 w-2.5 inline mr-0.5" />}
                            {event.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Log</CardTitle>
              <CardDescription className="text-xs">Last 50 notifications sent (test + real)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {log.length === 0 ? (
                <EmptyState title="No notifications sent yet" description="Test a channel to see it appear here." />
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {log.map(entry => (
                      <div key={entry.id} className="p-3 flex items-start gap-3">
                        <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                          entry.status === 'sent' ? 'bg-emerald-500' : entry.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{entry.channel}</span>
                            <Badge variant="outline" className="text-[9px]">{entry.event}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{entry.message}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(entry.timestamp).toLocaleString('en-US')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup guide */}
      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground space-y-2">
          <div className="font-medium text-foreground">How to set up each channel type:</div>
          <div><strong>Email (Resend):</strong> Sign up at resend.com (free 100/day). Add your API key in Settings → API Keys → resend. In production, emails send via <code className="bg-muted px-1 rounded font-mono">/api/notifications/email</code>.</div>
          <div><strong>Slack Webhook:</strong> Go to slack.com/apps → Incoming Webhooks → create. Paste the URL here. Free, unlimited.</div>
          <div><strong>Discord Webhook:</strong> Server Settings → Integrations → Webhooks → create. Paste the URL. Free, unlimited.</div>
          <div><strong>Generic Webhook:</strong> Any URL that accepts POST JSON. Free, depends on the service.</div>
          <div className="mt-2 pt-2 border-t">
            <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-500" />
            In static export mode (GitHub Pages), "Test" only logs the attempt — no real notification is sent.
            Deploy the private repo to a real backend to enable actual sending.
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function ChannelIcon({ type }: { type: NotificationChannel['type'] }) {
  const icons = {
    email: <Mail className="h-5 w-5 text-sky-500" />,
    slack: <MessageSquare className="h-5 w-5 text-violet-500" />,
    discord: <MessageSquare className="h-5 w-5 text-indigo-500" />,
    webhook: <Webhook className="h-5 w-5 text-amber-500" />,
  }
  return <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">{icons[type]}</div>
}
