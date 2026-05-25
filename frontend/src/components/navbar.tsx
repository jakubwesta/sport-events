import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { User } from '@/schemas'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors',
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )

const isEventsRoute = (pathname: string) =>
  pathname === '/' || pathname === '/events'

function getUserDisplayName(user: User): string {
  const first = user.first_name?.trim()
  const last = user.last_name?.trim()

  if (first && last) return `${first} ${last}`
  if (first) return first
  if (last) return last

  return user.email.split('@')[0] ?? user.email
}

type UserMenuProps = {
  user: User
  onLogout: () => void
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const displayName = getUserDisplayName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-48 gap-1.5"
          aria-label="Account menu"
        >
          <span className="truncate">{displayName}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate font-medium text-foreground">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AuthButtons() {
  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <NavLink to="/login" className={navLinkClass}>
          Login
        </NavLink>
      </Button>
      <Button size="sm" asChild>
        <Link to="/register">Register</Link>
      </Button>
    </>
  )
}

export function Navbar() {
  const { user, isReady, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const eventsNavActive = isEventsRoute(pathname)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const showUserMenu = Boolean(user)

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
            <NavLink
              to="/"
              className={() => navLinkClass({ isActive: eventsNavActive })}
            >
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
                <Link to="/">Events</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/map">Map</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/results">Results</Link>
              </DropdownMenuItem>
              {showUserMenu ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : isReady ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">Register</Link>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <ModeToggle />
          {!isReady ? null : showUserMenu && user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  )
}
