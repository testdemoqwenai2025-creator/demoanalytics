import { PLUGINS } from '@/lib/plugins'
import PluginClient from './plugin-client'

export function generateStaticParams() {
  return PLUGINS.map(p => ({ name: p.name }))
}

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  return <PluginClient name={name} />
}
