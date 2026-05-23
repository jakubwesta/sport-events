import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function AuthModeSwitch() {
  return (
    <div className="flex w-full rounded-full border border-border bg-secondary p-1">
      <NavLink
        to="/login"
        className={({ isActive }) =>
          cn(
            'flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )
        }
      >
        Login
      </NavLink>
      <NavLink
        to="/register"
        className={({ isActive }) =>
          cn(
            'flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )
        }
      >
        Register
      </NavLink>
    </div>
  )
}
