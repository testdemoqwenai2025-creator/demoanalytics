'use client'

import * as React from 'react'
import { Sidebar } from '@/components/layout/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-4 md:p-6" id="app-main">
        {children}
      </main>
    </div>
  )
}
