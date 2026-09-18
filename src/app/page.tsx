import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden" id="dashboard-root">
          <DashboardShell />
        </main>
      </div>
    </div>
  )
}

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
