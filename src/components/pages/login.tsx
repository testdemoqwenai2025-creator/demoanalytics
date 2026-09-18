'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff, Github, ArrowRight, User, ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useDashboardStore } from '@/lib/store'
import { authenticate, type Role } from '@/lib/auth'
import { toast } from 'sonner'

// Mock credentials (in production, these would be real OAuth accounts)
const DEMO_CREDENTIALS: Record<Role, { email: string; password: string; role: Role }> = {
  demo: { email: 'demo@meridian.template', password: 'demo', role: 'demo' },
  admin: { email: 'admin@meridian.template', password: 'admin', role: 'admin' },
  enterprise: { email: 'enterprise@meridian.template', password: 'enterprise', role: 'enterprise' },
}

export function LoginPage() {
  const login = useDashboardStore(s => s.login)
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    // Use the real authenticate function from auth.ts
    const user = authenticate(email, password)
    if (!user) {
      setLoading(false)
      setErrors({ password: 'Invalid credentials. Use demo@meridian.template/demo, admin@meridian.template/admin, or enterprise@meridian.template/enterprise' })
      return
    }

    login(user.email, user.role)
    setLoading(false)

    toast.success(`Logged in as ${user.role}`, {
      description: `Welcome, ${user.name}. Role: ${user.role.toUpperCase()}. No real credentials were transmitted.`,
    })
    router.push('/dashboard')
  }

  const quickLogin = (role: Role) => {
    const creds = DEMO_CREDENTIALS[role]
    setEmail(creds.email)
    setPassword(creds.password)
    setLoading(true)
    setTimeout(() => {
      login(creds.email, role)
      setLoading(false)
      toast.success(`Logged in as ${role}`, {
        description: `Quick ${role} login — explore ${role === 'enterprise' ? 'all features + user management + SSO' : role === 'admin' ? 'all features' : 'read-only dashboards'}.`,
      })
      router.push('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-fit rounded-full border bg-background p-2">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Mock authentication — nothing is sent or stored on a server.</p>
        </div>

        {/* Quick login cards */}
        <div className="grid grid-cols-3 gap-2">
          <QuickLoginCard
            role="demo"
            icon={User}
            title="Demo"
            description="Read-only"
            onClick={() => quickLogin('demo')}
          />
          <QuickLoginCard
            role="admin"
            icon={ShieldCheck}
            title="Admin"
            description="Full access"
            onClick={() => quickLogin('admin')}
          />
          <QuickLoginCard
            role="enterprise"
            icon={Building2}
            title="Enterprise"
            description="Users + SSO"
            onClick={() => quickLogin('enterprise')}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or sign in manually</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="analyst@example.com" value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                    className="pl-9" autoComplete="email" />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info('Use demo@meridian.template/demo or admin@meridian.template/admin')}>
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                    className="pl-9 pr-10" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full"
                onClick={() => toast.info('GitHub OAuth is a stub in the mock template.')}>
                <Github className="h-3.5 w-3.5 mr-2" /> GitHub
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Credentials hint */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-[11px] space-y-1">
                <div className="font-medium">Mock credentials (three roles):</div>
                <div className="font-mono text-muted-foreground">
                  <div>Demo:       <code className="bg-muted px-1 rounded">demo@meridian.template</code> / <code className="bg-muted px-1 rounded">demo</code></div>
                  <div>Admin:      <code className="bg-muted px-1 rounded">admin@meridian.template</code> / <code className="bg-muted px-1 rounded">admin</code></div>
                  <div>Enterprise: <code className="bg-muted px-1 rounded">enterprise@meridian.template</code> / <code className="bg-muted px-1 rounded">enterprise</code></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Mock auth — no backend, no credentials stored on server
          </Badge>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

function QuickLoginCard({ role, icon: Icon, title, description, onClick }: {
  role: Role
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-md border p-2.5 hover:border-primary hover:bg-accent/40 transition-colors group"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
          role === 'enterprise' ? 'bg-violet-500 text-white' :
          role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
    </button>
  )
}
