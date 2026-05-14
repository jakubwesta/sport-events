import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="max-w-lg border-border text-center shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Sport Events
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Welcome to the sport events platform.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
