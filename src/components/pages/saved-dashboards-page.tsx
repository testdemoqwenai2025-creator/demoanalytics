'use client'

import * as React from 'react'
import { Save, Trash2, Layout, Plus, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLayoutStore } from '@/lib/dashboard-layouts'
import { DASHBOARD_SECTIONS } from '@/lib/dashboard-sections'
import { useDashboardStore } from '@/lib/store'
import { SectionHeading } from '@/components/dashboard/primitives'
import { toast } from 'sonner'

export function SavedDashboardsPage() {
  const { layouts, activeLayoutId, setActiveLayout, saveLayout, deleteLayout } = useLayoutStore()
  const activeSection = useDashboardStore(s => s.activeSection)
  const setActiveSection = useDashboardStore(s => s.setActiveSection)

  const [newLayoutName, setNewLayoutName] = React.useState('')
  const [selectedSections, setSelectedSections] = React.useState<string[]>(
    layouts.find(l => l.id === activeLayoutId)?.sectionIds || DASHBOARD_SECTIONS.map(s => s.id)
  )

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!newLayoutName.trim()) {
      toast.error('Layout name required')
      return
    }
    if (selectedSections.length === 0) {
      toast.error('Select at least one section')
      return
    }
    saveLayout(newLayoutName.trim(), selectedSections)
    toast.success(`Layout "${newLayoutName.trim()}" saved`)
    setNewLayoutName('')
  }

  const handleApply = (layoutId: string) => {
    setActiveLayout(layoutId)
    const layout = layouts.find(l => l.id === layoutId)
    if (layout && layout.sectionIds[0]) {
      setActiveSection(layout.sectionIds[0] as any)
    }
    toast.success('Layout applied')
  }

  return (
    <>
      <SectionHeading
        title="Saved Dashboards"
        description="Create custom dashboard layouts by selecting which sections to show. Layouts persist across sessions."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Saved layouts list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Layout className="h-4 w-4" /> Saved Layouts ({layouts.length})
            </CardTitle>
            <CardDescription className="text-xs">Click to apply. Default layout includes all sections.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {layouts.map(layout => (
                  <div
                    key={layout.id}
                    className={`rounded-md border p-3 transition-colors ${
                      layout.id === activeLayoutId ? 'border-primary bg-primary/5' : 'hover:bg-accent/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{layout.name}</span>
                          {layout.isDefault && <Badge variant="outline" className="text-[9px]">default</Badge>}
                          {layout.id === activeLayoutId && <Check className="h-3 w-3 text-emerald-500" />}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {layout.sectionIds.length} sections · created {new Date(layout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {layout.sectionIds.slice(0, 6).map(sid => {
                            const section = DASHBOARD_SECTIONS.find(s => s.id === sid)
                            return section ? (
                              <Badge key={sid} variant="outline" className="text-[9px]">{section.label}</Badge>
                            ) : null
                          })}
                          {layout.sectionIds.length > 6 && (
                            <Badge variant="outline" className="text-[9px]">+{layout.sectionIds.length - 6}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]"
                          onClick={() => handleApply(layout.id)}>
                          Apply
                        </Button>
                        {!layout.isDefault && (
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-destructive"
                            onClick={() => { deleteLayout(layout.id); toast.success('Layout deleted') }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Create new layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create New Layout
            </CardTitle>
            <CardDescription className="text-xs">Select sections to include, name your layout, and save.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium">Layout name</label>
              <Input
                value={newLayoutName}
                onChange={e => setNewLayoutName(e.target.value)}
                placeholder="e.g., Morning Routine, Incident Response..."
                className="mt-1 h-9 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block">Sections ({selectedSections.length} selected)</label>
              <div className="space-y-1.5">
                {DASHBOARD_SECTIONS.map(section => (
                  <label
                    key={section.id}
                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/40 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{section.label}</div>
                      <div className="text-[10px] text-muted-foreground">{section.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={!newLayoutName.trim() || selectedSections.length === 0}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Layout
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> Layouts are saved to your browser's
          localStorage (key: <code className="bg-muted px-1 rounded font-mono">meridian-dashboard-layouts</code>).
          When you apply a layout, the dashboard shows only the selected sections in your chosen order.
          Layouts persist across page reloads. With real authentication (#1 on the roadmap), layouts
          would sync across devices via the user profile.
        </CardContent>
      </Card>
    </>
  )
}
