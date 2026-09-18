'use client'

import * as React from 'react'
import Link from 'next/link'
import { Github, Shield, Heart } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
                M
              </div>
              <span className="font-semibold text-sm">MERIDIAN</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A hyperscale data analyst template for capital markets. Open-source preview,
              synthetic data, no NDA required.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-3">Explore</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/markets" className="text-muted-foreground hover:text-foreground">Live Markets</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-foreground">News Feeds</Link></li>
              <li><Link href="/files" className="text-muted-foreground hover:text-foreground">Files</Link></li>
              <li><Link href="/automate" className="text-muted-foreground hover:text-foreground">Automation</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-3">Resources</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing &amp; Limits</Link></li>
              <li><Link href="/settings" className="text-muted-foreground hover:text-foreground">Settings</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
              <li>
                <a
                  href="https://github.com/testdemoqwenai2025-creator/demoanalytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <Github className="h-3 w-3" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* GDPR / Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Privacy &amp; GDPR
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This template does not collect personal data, set cookies, or load third-party
              trackers. All dashboard data is synthetic or fetched client-side from free
              public APIs. Login is mock-only &mdash; no credentials are transmitted or stored.
            </p>
            <Link href="/about" className="text-[11px] text-primary hover:underline mt-2 inline-block">
              Read full privacy notice &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} MERIDIAN Data Analyst Template. MIT License.
            Synthetic data &mdash; any resemblance to real entities is coincidental.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>using Next.js, Tailwind, and shadcn/ui</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
