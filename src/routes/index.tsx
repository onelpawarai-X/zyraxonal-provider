import { createFileRoute } from '@tanstack/react-router'
import { Directory } from '@/components/directory/directory'
import { directoryHead } from '@/lib/catalog'

export const Route = createFileRoute('/')({
  head: () => directoryHead('AI Models'),
  component: Index,
})

function Index() {
  return <Directory view="models" />
}
