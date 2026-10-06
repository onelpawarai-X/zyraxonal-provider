import { createFileRoute } from '@tanstack/react-router'
import { Directory } from '@/components/directory/directory'
import { directoryHead } from '@/lib/catalog'

export const Route = createFileRoute('/providers')({
  head: () => directoryHead('AI Providers'),
  component: ProvidersPage,
})

function ProvidersPage() {
  return <Directory view="providers" />
}
