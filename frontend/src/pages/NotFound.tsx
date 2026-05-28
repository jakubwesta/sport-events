import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <p className="text-7xl font-bold tracking-tight text-foreground">404</p>
      <p className="text-lg font-medium text-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild variant="outline" className="mt-2 gap-2">
        <Link to="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to events
        </Link>
      </Button>
    </main>
  )
}
