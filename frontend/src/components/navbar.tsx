import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors',
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground'
  )

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          Sport events
        </Link>
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 sm:flex"
          aria-label="Main"
        >
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/map" className={navLinkClass}>
              Map
            </NavLink>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/results" className={navLinkClass}>
              Results
            </NavLink>
          </Button>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 sm:hidden">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Open navigation menu"
              >
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/events">Events</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/map">Map</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/results">Results</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
