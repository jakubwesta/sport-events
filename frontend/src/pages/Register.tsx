import { useState } from "react"

import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function RegisterPage() {
  const [role, setRole] = useState("user")

  return (
    <AuthPageLayout>
      <Card className="border-border shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="leading-relaxed">
            Fill out the form to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="register-first-name">First name</Label>
                <Input
                  id="register-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-last-name">Last name</Label>
                <Input
                  id="register-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password-repeat">Repeat password</Label>
              <Input
                id="register-password-repeat"
                name="passwordRepeat"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-role">Role</Label>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger
                  id="register-role"
                  className="w-full"
                  aria-label="Role"
                >
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Choose Organizer if you want to create events
              </p>
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthPageLayout>
  )
}
