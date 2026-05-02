import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Icon } from "@workspace/ui/icons"
import { AnimatedThemeToggler } from "@workspace/ui/components/composed/animated-theme-toggler"
import { SignInPageClient } from "@workspace/ui/components/composed/auth/sign-in-page-client"

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background tac-fui-grid overflow-hidden p-4">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <AnimatedThemeToggler />
        <Button variant="ghost" asChild className="text-foreground text-sm font-semibold tracking-wide">
          <Link href="/">
            <Icon name="arrowLeft" className="mr-2 w-4 h-4" /> HOME
          </Link>
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-sans text-2xl font-bold text-primary tracking-widest uppercase">
            TAC Express
          </h1>
          <p className="mt-1 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Logistics Operating System
          </p>
        </div>
        <div className="border border-border bg-card p-6 shadow-brutal-sm">
          <SignInPageClient redirectTo="/dashboard" />
        </div>
      </div>
    </div>
  )
}
