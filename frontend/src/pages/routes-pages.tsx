import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export { LoginPage } from './Login'
export { MapPage } from './Map'
export { RegisterPage } from './Register'
export { EventsPage } from './Events'
export { CreateEventPage } from './CreateEvent'
export { EventDetailsPage } from './EventDetails'

function SimplePage({ title }: { title: string }) {
  return (
    <main className="container flex flex-1 flex-col px-4 py-10 sm:px-6">
      <Card className="max-w-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
          <CardDescription>This section is ready for your content.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}

export function ResultsPage() {
  return <SimplePage title="Results" />
}
