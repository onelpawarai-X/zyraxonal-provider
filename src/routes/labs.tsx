import { createFileRoute } from '@tanstack/react-router'
import { Directory } from '@/components/directory/directory'
import { directoryHead } from '@/lib/catalog'

export const Route = createFileRoute('/labs')({
  head: () => directoryHead('AI Labs'),
  component: LabsPage,
})

function LabsPage() {
  return <Directory view="labs" />
}
