import { SignInPageClient } from "@workspace/ui/components/composed/auth/sign-in-page-client"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background tac-fui-grid">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-mono font-bold text-primary tracking-widest uppercase">
            TAC Express
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Logistics Operating System
          </p>
        </div>
        <div className="border border-border bg-card p-6 shadow-brutal-sm">
          <SignInPageClient redirectTo="/home" />
        </div>
      </div>
    </div>
  )
}
