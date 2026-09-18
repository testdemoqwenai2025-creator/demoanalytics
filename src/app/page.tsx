'use client'

import * as React from 'react'
import { useDashboardStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Footer } from '@/components/layout/footer'
import { HomePage } from '@/components/pages/home'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { MarketsPage } from '@/components/pages/markets'
import { AutomatePage } from '@/components/pages/automate'
import { AboutPage } from '@/components/pages/about'
import { DocsPage } from '@/components/pages/docs'
import { LoginPage } from '@/components/pages/login'

const PAGES: Record<string, React.ComponentType> = {
  home: HomePage,
  dashboard: DashboardPage,
  markets: MarketsPage,
  automate: AutomatePage,
  about: AboutPage,
  docs: DocsPage,
  login: LoginPage,
}

export default function Page() {
  const activePage = useDashboardStore(s => s.activePage)
  const Page = PAGES[activePage] ?? HomePage

  // Landing page has a different layout (no sidebar)
  const isLanding = activePage === 'home'

  if (isLanding) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Topbar />
        <main className="flex-1">
          <Page />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Page />
        </main>
        <Footer />
      </div>
    </div>
  )
}
