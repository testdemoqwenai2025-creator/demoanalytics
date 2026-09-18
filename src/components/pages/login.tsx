'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff, Github, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useDashboardStore } from '@/lib/store'
import { toast } from 'sonner'

export function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  const login = useDashboardStore(s => s.login)
  const router = useRouter()

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Minimum 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    login(email)
    setLoading(false)
    toast.success('Logged in (mock auth)', {
      description: `Welcome, ${email}. No credentials were transmitted or stored.`,
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-fit rounded-full border bg-background p-2">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Mock authentication &mdash; nothing is sent or stored.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="analyst@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className="pl-9" autoComplete="email" />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info('Password reset is not implemented in the mock template.')}>
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-10"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))} />
                <Label htmlFor="remember" className="text-xs font-normal cursor-pointer">
                  Keep me signed in (mock &mdash; persists in browser session only)
                </Label>
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

            <p className="mt-4 text-center text-xs text-muted-foreground">
              No account?{' '}
              <button type="button"
                onClick={() => toast.info('Sign-up is not implemented in the mock template.')}
                className="text-foreground font-medium hover:underline">
                Create one
              </button>
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Mock auth &mdash; no backend, no credentials stored
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
