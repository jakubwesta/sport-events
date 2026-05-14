import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-muted px-4 py-10 sm:py-14">
      <div className="mb-6 flex w-full max-w-md rounded-full border border-border bg-secondary p-1">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            cn(
              "flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) =>
            cn(
              "flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          Register
        </NavLink>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}
