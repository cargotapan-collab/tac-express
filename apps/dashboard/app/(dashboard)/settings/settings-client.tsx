"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"

import { useSession } from "@workspace/ui/hooks/use-session"
import { useUpdateOwnProfile } from "@workspace/services/hooks/use-admin"
import { useNotificationStore } from "@workspace/services/stores/notification.store"

import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { PageShell } from "@workspace/ui/components/composed/page-shell"
import { ProfileCompletionCard } from "@workspace/ui/components/composed/settings/profile-completion-card"
import {
  ProfileForm,
  type ProfileSubmitValues,
} from "@workspace/ui/components/composed/settings/profile-form"
import { ShortcutsCard } from "@workspace/ui/components/composed/settings/shortcuts-card"
import { Label } from "@workspace/ui/components/primitives/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/primitives/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/primitives/toggle-group"
import { Badge } from "@workspace/ui/components/primitives/badge"
import {
  RiAccountCircleLine,
  RiShieldCheckLine,
  RiPaletteLine,
  RiPlugLine,
  RiHistoryLine,
  RiSunLine,
  RiMoonClearLine,
  RiContrastLine,
  RiKey2Line,
  RiTimeLine,
} from "@workspace/ui/icons"

const RiPlay = RiTimeLine

export function SettingsClient() {
  const { session } = useSession()
  const updateProfile = useUpdateOwnProfile()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { theme, setTheme } = useTheme()

  const [saved, setSaved] = React.useState(false)
  // Live form values lifted from ProfileForm via onValuesChange so the
  // sidebar ProfileCompletionCard can update as the operator types.
  const [liveValues, setLiveValues] = React.useState<{
    name: string
    hubCode: string
  }>({ name: "", hubCode: "" })

  const profileDefaults = React.useMemo(
    () => ({
      name: (session?.user?.user_metadata?.name as string) ?? "",
      hubCode: (session?.user?.user_metadata?.hubCode as string) ?? "",
    }),
    [session],
  )

  async function handleProfileSubmit(values: ProfileSubmitValues) {
    if (!session?.user?.id) return
    try {
      await updateProfile.mutateAsync({
        userId: session.user.id,
        payload: { name: values.name, hubCode: values.hubCode },
      })
      addNotification({
        type: "success",
        title: "Settings saved",
        message: "Profile updated",
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      addNotification({
        type: "error",
        title: "Save failed",
        message: String(err),
      })
    }
  }

  return (
    <PageShell>
      <PageHeader
        overline="Account"
        title="Settings"
        description="Manage your profile, security, theme, and integrations"
      />

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">
            <RiAccountCircleLine />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <RiShieldCheckLine />
            Security
          </TabsTrigger>
          <TabsTrigger value="theme">
            <RiPaletteLine />
            Theme
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <RiPlugLine />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="audit">
            <RiHistoryLine />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Profile — 2-column on lg+ : form on the left, summary widgets on the right */}
        <TabsContent value="profile" className="pt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ProfileForm
                email={session?.user?.email ?? "—"}
                defaultValues={profileDefaults}
                isSaving={updateProfile.isPending}
                saved={saved}
                onSubmit={handleProfileSubmit}
                onValuesChange={setLiveValues}
              />
            </div>

            <aside className="space-y-6">
              <ProfileCompletionCard
                fields={[
                  { label: "Display name", filled: Boolean(liveValues.name.trim()) },
                  { label: "Hub code", filled: Boolean(liveValues.hubCode.trim()) },
                ]}
              />
              <ShortcutsCard />
              <SystemInfoCard />
            </aside>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="pt-4 space-y-6">
          <div className="tac-fui-panel space-y-4 bg-card p-5">
            <p className="border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Session security
            </p>
            <SecurityItem
              icon={<RiPlay className="size-4" />}
              title="Idle timeout"
              description="You'll be signed out after 30 minutes of inactivity. Activity in any open tab keeps your session alive."
              status="Enforced · 30 min"
              statusTone="success"
            />
            <SecurityItem
              icon={<RiShieldCheckLine className="size-4" />}
              title="Multi-factor authentication"
              description="TOTP enrollment ships in Phase 7.5 alongside the auth surface refresh."
              status="Coming soon"
              statusTone="muted"
            />
            <SecurityItem
              icon={<RiKey2Line className="size-4" />}
              title="API access tokens"
              description="Personal API keys for programmatic access. Manage at /settings/api-keys."
              status="Manage"
              statusTone="primary"
              href="/settings/api-keys"
            />
          </div>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme" className="pt-4">
          <div className="tac-fui-panel space-y-4 bg-card p-5">
            <p className="border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Appearance
            </p>
            <Field label="Theme">
              <ToggleGroup
                type="single"
                value={theme ?? "system"}
                onValueChange={(v) => v && setTheme(v)}
                className="w-full max-w-md"
              >
                <ToggleGroupItem value="light" className="flex-1 gap-1.5">
                  <RiSunLine />
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    Light
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" className="flex-1 gap-1.5">
                  <RiMoonClearLine />
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    Dark
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="system" className="flex-1 gap-1.5">
                  <RiContrastLine />
                  <span className="font-mono text-[11px] uppercase tracking-widest">
                    System
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              The TAC Orbital v3.0 Indigo Mission-Control palette is the only
              brand theme. We respect the OS-level{" "}
              <code className="font-mono">prefers-reduced-motion</code> setting
              regardless of theme choice.
            </p>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="pt-4 space-y-6">
          <div className="tac-fui-panel space-y-4 bg-card p-5">
            <p className="border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Active integrations
            </p>
            <SecurityItem
              icon={<RiPlugLine className="size-4" />}
              title="Webhooks"
              description="Outbound delivery for shipment, manifest, and invoice events."
              status="Manage"
              statusTone="primary"
              href="/settings/webhooks"
            />
            <SecurityItem
              icon={<RiKey2Line className="size-4" />}
              title="API keys"
              description="Generate scoped tokens for system-to-system access."
              status="Manage"
              statusTone="primary"
              href="/settings/api-keys"
            />
            <SecurityItem
              icon={<RiShieldCheckLine className="size-4" />}
              title="GST E-Invoice (IRP)"
              description="NIC sandbox is wired in code. Provide credentials in env to activate."
              status="Phase 4.5"
              statusTone="muted"
            />
            <SecurityItem
              icon={<RiShieldCheckLine className="size-4" />}
              title="E-Way Bill"
              description="Auto-generates for shipments above ₹50k declared value."
              status="Phase 4.5"
              statusTone="muted"
            />
          </div>
        </TabsContent>

        {/* Audit */}
        <TabsContent value="audit" className="pt-4">
          <div className="tac-fui-panel space-y-3 bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Audit stream
            </p>
            <p className="text-sm">
              Every change made through the dashboard — creates, updates,
              deletes, role and permission changes — is appended to the audit
              log. Each entry captures actor, timestamp, IP, user-agent, and a
              before/after diff of the modified record.
            </p>
            <div>
              <Link
                href="/audit"
                className="inline-flex h-8 items-center gap-2 border border-border px-3 font-mono text-[10px] uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <RiHistoryLine className="size-3.5" />
                Open audit log
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}


function SecurityItem({
  icon,
  title,
  description,
  status,
  statusTone,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: string
  statusTone: "success" | "muted" | "primary"
  href?: string
}) {
  const StatusEl =
    statusTone === "success" ? (
      <Badge variant="secondary" className="gap-1 font-mono">
        <span className="size-1.5 bg-status-success" />
        {status}
      </Badge>
    ) : statusTone === "primary" ? (
      <Badge variant="default" className="font-mono">
        {status}
      </Badge>
    ) : (
      <Badge variant="outline" className="font-mono">
        {status}
      </Badge>
    )

  const Inner = (
    <div className="flex items-start justify-between gap-3 border border-border bg-background px-3 py-2">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 items-center justify-center border border-border bg-muted">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {StatusEl}
    </div>
  )

  return href ? (
    <Link
      href={href}
      className="block transition-colors hover:[&_div]:bg-muted/40"
    >
      {Inner}
    </Link>
  ) : (
    Inner
  )
}

function SystemInfoCard({ className }: { className?: string }) {
  return (
    <div className={`tac-fui-panel space-y-3 bg-card p-5 ${className ?? ""}`}>
      <p className="border-b border-border pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        System information
      </p>
      <div className="space-y-2">
        {[
          { label: "Version", value: "TAC Express v1.0" },
          { label: "Environment", value: process.env.NODE_ENV ?? "production" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className="font-mono text-xs text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

