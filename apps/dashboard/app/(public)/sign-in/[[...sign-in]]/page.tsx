import { SignInPageClient } from "@workspace/ui/components/composed/auth/sign-in-page-client"
import { SignInSplitLayout } from "@workspace/ui/components/composed/auth/sign-in-split-layout"
import { AnimatedThemeToggler } from "@workspace/ui/components/composed/animated-theme-toggler"

export default function SignInPage() {
  return (
    <SignInSplitLayout
      heading="Mission control access"
      eyebrow="TAC EXPRESS · OPS CONSOLE"
      description="Restricted to authorised dispatch and operations personnel. Contact your administrator if you cannot sign in."
      imageCaption="DISPATCH · LIVE"
      topRightSlot={<AnimatedThemeToggler />}
    >
      <SignInPageClient redirectTo="/home" />
    </SignInSplitLayout>
  )
}
