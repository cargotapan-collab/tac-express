"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import { Textarea } from "@workspace/ui/components/primitives/textarea"
import { Badge } from "@workspace/ui/components/primitives/badge"
import { Checkbox } from "@workspace/ui/components/primitives/checkbox"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/primitives/radio-group"
import { Switch } from "@workspace/ui/components/primitives/switch"
import { Toggle } from "@workspace/ui/components/primitives/toggle"
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/primitives/toggle-group"
import { Separator } from "@workspace/ui/components/primitives/separator"
import { Skeleton } from "@workspace/ui/components/primitives/skeleton"
import { EmptyState } from "@workspace/ui/components/primitives/empty-state"
import { ScrollArea } from "@workspace/ui/components/primitives/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/primitives/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/primitives/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/primitives/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/primitives/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/primitives/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/primitives/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/primitives/popover"
import { DatePicker } from "@workspace/ui/components/primitives/date-picker"
import { DateRangePicker } from "@workspace/ui/components/primitives/date-range-picker"
import { Calendar } from "@workspace/ui/components/primitives/calendar"
import { Combobox } from "@workspace/ui/components/primitives/combobox"
import { MultiSelect } from "@workspace/ui/components/primitives/multi-select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/primitives/command"
import { RichTextEditor } from "@workspace/ui/components/primitives/rich-text-editor"
import { FileDropzone } from "@workspace/ui/components/primitives/file-dropzone"
import { SignaturePad } from "@workspace/ui/components/primitives/signature-pad"
import { UniversalBarcode } from "@workspace/ui/components/primitives/universal-barcode"

import { PageHeader } from "@workspace/ui/components/composed/page-header"
import {
  RiBox3Line,
  RiAlertLine,
  RiCheckLine,
  RiInformationLine,
} from "@workspace/ui/icons"

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian" },
]

export function UiKitClient() {
  const [check, setCheck] = React.useState(false)
  const [radio, setRadio] = React.useState("a")
  const [sw, setSw] = React.useState(true)
  const [toggle, setToggle] = React.useState(false)
  const [tg, setTg] = React.useState("a")
  const [combo, setCombo] = React.useState("apple")
  const [multi, setMulti] = React.useState<string[]>(["apple", "banana"])
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [files, setFiles] = React.useState<
    React.ComponentProps<typeof FileDropzone>["value"]
  >([])

  return (
    <div className="space-y-10 pb-24">
      <PageHeader
        overline="Dev"
        title="UI Kit"
        description="Tour of every primitive and composed component shipped by @workspace/ui. Use this page as a visual regression target."
      />

      {/* Type scale + label primitives */}
      <Showcase
        id="typography"
        title="Typography"
        description="Heading + mono + uppercase tracking primitives."
      >
        <h1 className="font-heading text-4xl font-black tracking-tight">
          Heading 1<span className="text-primary">.</span>
        </h1>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Heading 2
        </h2>
        <h3 className="font-heading text-lg font-semibold">Heading 3</h3>
        <p className="text-sm">
          Body text · regular weight, tabular nums.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Mono · 10px micro label
        </p>
      </Showcase>

      {/* Color tokens */}
      <Showcase
        id="tokens"
        title="Color tokens"
        description="Semantic tokens — never use raw hex or palette classes outside globals.css."
      >
        <div className="grid grid-cols-3 gap-px bg-border/40 sm:grid-cols-6">
          {[
            "background",
            "foreground",
            "primary",
            "secondary",
            "muted",
            "accent",
            "destructive",
            "border",
          ].map((tok) => (
            <Swatch key={tok} token={tok} />
          ))}
          <Swatch token="status-success" cssVar="--accent-success" />
          <Swatch token="status-warning" cssVar="--accent-warning" />
          <Swatch token="status-error" cssVar="--accent-danger" />
          <Swatch token="status-info" cssVar="--accent-info" />
        </div>
      </Showcase>

      {/* Buttons */}
      <Showcase
        id="buttons"
        title="Buttons"
        description="default · destructive · outline · secondary · ghost · link · glow"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Box">
            <RiBox3Line />
          </Button>
        </div>
      </Showcase>

      {/* Badges */}
      <Showcase id="badges" title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge>
            <RiCheckLine className="size-3" />
            Verified
          </Badge>
        </div>
      </Showcase>

      {/* Inputs */}
      <Showcase
        id="inputs"
        title="Form inputs"
        description="Input · Textarea · Label · Switch · Checkbox · Radio · Toggle"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ui-input">Text input</Label>
            <Input id="ui-input" placeholder="Type something" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ui-textarea">Textarea</Label>
            <Textarea id="ui-textarea" rows={3} placeholder="Multi-line" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <Checkbox
              checked={check}
              onCheckedChange={(v) => setCheck(v === true)}
            />
            Checkbox
          </label>
          <RadioGroup
            value={radio}
            onValueChange={setRadio}
            className="flex items-center gap-3"
          >
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
              <RadioGroupItem value="a" /> A
            </label>
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
              <RadioGroupItem value="b" /> B
            </label>
          </RadioGroup>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <Switch checked={sw} onCheckedChange={setSw} /> Switch
          </label>
          <Toggle
            pressed={toggle}
            onPressedChange={setToggle}
            variant="outline"
          >
            Toggle
          </Toggle>
          <ToggleGroup
            type="single"
            value={tg}
            onValueChange={(v) => v && setTg(v)}
          >
            <ToggleGroupItem value="a">A</ToggleGroupItem>
            <ToggleGroupItem value="b">B</ToggleGroupItem>
            <ToggleGroupItem value="c">C</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Showcase>

      {/* Combobox + multi-select + date */}
      <Showcase
        id="comboboxes"
        title="Combobox · Multi-Select · Date pickers"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>Combobox</Label>
            <Combobox
              options={FRUITS}
              value={combo}
              onChange={setCombo}
              placeholder="Pick a fruit"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Multi-select</Label>
            <MultiSelect
              options={FRUITS}
              value={multi}
              onChange={setMulti}
              placeholder="Pick fruits"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Date picker</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Date range picker</Label>
            <DateRangePicker numberOfMonths={2} />
          </div>
        </div>
      </Showcase>

      {/* Calendar */}
      <Showcase id="calendar" title="Calendar">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </Showcase>

      {/* Overlays */}
      <Showcase id="overlays" title="Dialog · Sheet · AlertDialog · Dropdown · Tooltip · Popover">
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sample dialog</DialogTitle>
                <DialogDescription>
                  Brutalist offset shadow, 0px radius, Space Grotesk title.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm">
                Body content lives here.
              </p>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Side sheet</SheetTitle>
                <SheetDescription>Slides in from the right.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Confirm destructive</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>I am a tooltip</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-sm">Free-form content lives here.</p>
            </PopoverContent>
          </Popover>
        </div>
      </Showcase>

      {/* Tabs + Accordion + ScrollArea */}
      <Showcase id="navigation" title="Tabs · Accordion · ScrollArea">
        <Tabs defaultValue="one">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
            <TabsTrigger value="three">Three</TabsTrigger>
          </TabsList>
          <TabsContent value="one" className="pt-2 text-sm">
            Tab one content.
          </TabsContent>
          <TabsContent value="two" className="pt-2 text-sm">
            Tab two content.
          </TabsContent>
          <TabsContent value="three" className="pt-2 text-sm">
            Tab three content.
          </TabsContent>
        </Tabs>

        <Accordion type="single" collapsible className="border border-border bg-background">
          <AccordionItem value="i1" className="px-3">
            <AccordionTrigger>What is TAC Orbital?</AccordionTrigger>
            <AccordionContent>
              The brand-only design system with brutalist offset shadows,
              0rem radius, and Space Grotesk + JetBrains Mono.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="i2" className="px-3">
            <AccordionTrigger>Where do icons come from?</AccordionTrigger>
            <AccordionContent>
              <code className="font-mono text-xs">@remixicon/react</code>{" "}
              re-exported from <code className="font-mono text-xs">@workspace/ui/icons</code>.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ScrollArea className="h-32 border border-border bg-background p-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <p key={i} className="font-mono text-xs">
              Scroll line {i + 1}
            </p>
          ))}
        </ScrollArea>
      </Showcase>

      {/* Empty state + Skeleton */}
      <Showcase id="states" title="Empty state · Skeleton">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            icon={<RiBox3Line />}
            title="No shipments yet"
            description="Once shipments arrive, they'll show up here in the queue."
            action={<Button size="sm">Create shipment</Button>}
          />
          <div className="space-y-3 border border-border bg-card p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Showcase>

      {/* Command */}
      <Showcase id="command" title="Command (cmdk)">
        <Command className="border border-border">
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem>
                <RiCheckLine className="size-4" />
                Approve
              </CommandItem>
              <CommandItem>
                <RiAlertLine className="size-4" />
                Flag
              </CommandItem>
              <CommandItem>
                <RiInformationLine className="size-4" />
                Inspect
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Showcase>

      {/* Rich text + file dropzone + signature */}
      <Showcase
        id="rich"
        title="Rich text · File dropzone · Signature"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <RichTextEditor
            placeholder="Write a note…"
            characterLimit={1000}
            toolbar="full"
          />
          <FileDropzone
            value={files}
            onChange={setFiles}
            accept="image/*"
            maxFiles={3}
            label="Drop files here"
          />
        </div>
        <SignaturePad width={400} height={120} />
      </Showcase>

      {/* Universal barcode */}
      <Showcase id="barcode" title="Universal Barcode">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2 border border-border bg-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Mode · screen
            </p>
            <UniversalBarcode value="TAC1234567890" mode="screen" />
          </div>
          <div className="grid gap-2 border border-border bg-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Mode · compact
            </p>
            <UniversalBarcode
              value="TAC1234567890"
              mode="compact"
              includeText={false}
            />
          </div>
          <div className="grid gap-2 border border-border bg-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Mode · thermal4x6
            </p>
            <UniversalBarcode value="TAC1234567890" mode="thermal4x6" />
          </div>
        </div>
      </Showcase>

      {/* Separator */}
      <Showcase id="separator" title="Separator">
        <p>Above</p>
        <Separator />
        <p>Below</p>
      </Showcase>
    </div>
  )
}

function Showcase({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      data-slot="ui-kit-section"
      className="space-y-3 border-l-2 border-primary/30 pl-4"
    >
      <header>
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {description}
          </p>
        )}
      </header>
      <div className="space-y-3 border border-border bg-card p-4">
        {children}
      </div>
    </section>
  )
}

function Swatch({ token, cssVar }: { token: string; cssVar?: string }) {
  const variable = cssVar ?? `--${token}`
  return (
    <div className="flex flex-col bg-background">
      <div
        className={cn(
          "h-12 border-b border-border",
          token === "destructive" && "bg-destructive",
          token === "primary" && "bg-primary",
          token === "secondary" && "bg-secondary",
          token === "muted" && "bg-muted",
          token === "accent" && "bg-accent",
          token === "background" && "bg-background",
          token === "foreground" && "bg-foreground",
          token === "border" && "bg-border"
        )}
        style={{
          backgroundColor:
            !["primary", "secondary", "muted", "accent", "background", "foreground", "destructive", "border"].includes(token)
              ? `var(${variable})`
              : undefined,
        }}
      />
      <p className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {token}
      </p>
    </div>
  )
}
