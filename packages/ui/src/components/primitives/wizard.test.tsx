import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { Wizard, WizardActions, type WizardStep } from "./wizard"

const STEPS: WizardStep[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta", description: "Greek 2" },
  { id: "c", label: "Gamma" },
]

describe("Wizard", () => {
  it("renders every step's label", () => {
    render(<Wizard steps={STEPS} currentIndex={0} />)
    for (const step of STEPS) {
      expect(screen.getByText(step.label)).toBeInTheDocument()
    }
  })

  it("renders 'Step N / M' overlines for each step", () => {
    render(<Wizard steps={STEPS} currentIndex={0} />)
    expect(screen.getByText("Step 1 / 3")).toBeInTheDocument()
    expect(screen.getByText("Step 2 / 3")).toBeInTheDocument()
    expect(screen.getByText("Step 3 / 3")).toBeInTheDocument()
  })

  it("renders the description when provided", () => {
    render(<Wizard steps={STEPS} currentIndex={0} />)
    expect(screen.getByText("Greek 2")).toBeInTheDocument()
  })

  it("marks the active step with aria-current='step' and exposes data-state per step", () => {
    render(<Wizard steps={STEPS} currentIndex={1} />)
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(3)

    expect(items[0]).toHaveAttribute("data-state", "done")
    expect(items[0]).not.toHaveAttribute("aria-current")

    expect(items[1]).toHaveAttribute("data-state", "active")
    expect(items[1]).toHaveAttribute("aria-current", "step")

    expect(items[2]).toHaveAttribute("data-state", "pending")
    expect(items[2]).not.toHaveAttribute("aria-current")
  })

  it("disables the step button for pending (idx > currentIndex) steps", () => {
    const onStepClick = vi.fn<(index: number) => void>()
    render(
      <Wizard steps={STEPS} currentIndex={0} onStepClick={onStepClick} />
    )
    const buttons = screen.getAllByRole("button")
    expect(buttons[0]).not.toBeDisabled() // active is reachable
    expect(buttons[1]).toBeDisabled()
    expect(buttons[2]).toBeDisabled()
  })

  it("calls onStepClick with the index when a reachable step is clicked", () => {
    const onStepClick = vi.fn<(index: number) => void>()
    render(
      <Wizard steps={STEPS} currentIndex={2} onStepClick={onStepClick} />
    )
    const buttons = screen.getAllByRole("button")
    fireEvent.click(buttons[0]!)
    expect(onStepClick).toHaveBeenCalledTimes(1)
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it("disables ALL step buttons when onStepClick is omitted", () => {
    render(<Wizard steps={STEPS} currentIndex={2} />)
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled()
    }
  })

  it("clamps out-of-range currentIndex defensively (over)", () => {
    render(<Wizard steps={STEPS} currentIndex={99} />)
    const items = screen.getAllByRole("listitem")
    expect(items[2]).toHaveAttribute("data-state", "active")
  })

  it("clamps out-of-range currentIndex defensively (under)", () => {
    render(<Wizard steps={STEPS} currentIndex={-5} />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveAttribute("data-state", "active")
  })

  it("renders an icon when supplied on a step", () => {
    function TestIcon({ className }: { className?: string }) {
      return <svg data-testid="test-icon" className={className} />
    }
    const stepsWithIcon: WizardStep[] = [
      { id: "x", label: "Identity", icon: TestIcon },
      { id: "y", label: "Address" },
    ]
    render(<Wizard steps={stepsWithIcon} currentIndex={0} />)
    expect(screen.getByTestId("test-icon")).toBeInTheDocument()
  })

  it("renders nothing when steps is empty (defensive guard)", () => {
    const { container } = render(<Wizard steps={[]} currentIndex={0} />)
    expect(container.firstChild).toBeNull()
  })
})

describe("WizardActions", () => {
  let onBack: Mock<() => void>
  let onNext: Mock<() => void>

  beforeEach(() => {
    onBack = vi.fn<() => void>()
    onNext = vi.fn<() => void>()
  })

  it("at step > 0: renders BACK enabled, calls onBack on click", () => {
    render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
      />
    )
    const back = screen.getByRole("button", { name: /^back$/i })
    expect(back).not.toBeDisabled()
    fireEvent.click(back)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it("at step 0 without onCancel: renders BACK disabled and never calls onBack", () => {
    render(
      <WizardActions
        currentIndex={0}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
      />
    )
    const back = screen.getByRole("button", { name: /^back$/i })
    expect(back).toBeDisabled()
    fireEvent.click(back)
    expect(onBack).not.toHaveBeenCalled()
  })

  it("at step 0 with onCancel: renders CANCEL enabled, calls onCancel on click, never calls onBack", () => {
    const onCancel = vi.fn<() => void>()
    render(
      <WizardActions
        currentIndex={0}
        totalSteps={4}
        onBack={onBack}
        onCancel={onCancel}
        onNext={onNext}
      />
    )
    const cancel = screen.getByRole("button", { name: /^cancel$/i })
    expect(cancel).not.toBeDisabled()
    fireEvent.click(cancel)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onBack).not.toHaveBeenCalled()
  })

  it("at non-final step: renders NEXT and calls onNext on click", () => {
    render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
      />
    )
    const next = screen.getByRole("button", { name: /^next$/i })
    fireEvent.click(next)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it("at final step: renders finalLabel and calls onNext on click", () => {
    render(
      <WizardActions
        currentIndex={3}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
        finalLabel="CREATE INVOICE"
      />
    )
    const submit = screen.getByRole("button", { name: /create invoice/i })
    expect(submit).not.toBeDisabled()
    fireEvent.click(submit)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it("respects isFinalStep override", () => {
    render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        isFinalStep
        onBack={onBack}
        onNext={onNext}
        finalLabel="DONE"
      />
    )
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^next$/i })).not.toBeInTheDocument()
  })

  it("when isSubmitting: shows submittingLabel and disables the next button", () => {
    render(
      <WizardActions
        currentIndex={3}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
        finalLabel="CREATE INVOICE"
        submittingLabel="CREATING…"
        isSubmitting
      />
    )
    const submit = screen.getByRole("button", { name: /creating/i })
    expect(submit).toBeDisabled()
  })

  it("nextDisabled disables the next button without isSubmitting", () => {
    render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
        nextDisabled
      />
    )
    expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled()
  })

  it("clamps out-of-range currentIndex when computing UI state and counter", () => {
    const onCancel = vi.fn<() => void>()
    // currentIndex=99, totalSteps=4 — should clamp to step 3 (final)
    const { rerender } = render(
      <WizardActions
        currentIndex={99}
        totalSteps={4}
        onBack={onBack}
        onCancel={onCancel}
        onNext={onNext}
        finalLabel="DONE"
      />
    )
    // Counter shows clamped value, not raw 100
    expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument()
    // Final-step detection works on clamped index → finalLabel button visible
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument()

    // Negative index — should clamp to step 0 (first)
    rerender(
      <WizardActions
        currentIndex={-5}
        totalSteps={4}
        onBack={onBack}
        onCancel={onCancel}
        onNext={onNext}
      />
    )
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
    // First-step UI: with onCancel provided, label is CANCEL
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument()
  })

  it("renders nothing when totalSteps is zero (defensive guard)", () => {
    const { container } = render(
      <WizardActions
        currentIndex={0}
        totalSteps={0}
        onBack={onBack}
        onNext={onNext}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it("swallows async-handler rejections without throwing (fire-and-forget catch)", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const rejecting: Mock<() => Promise<void>> = vi.fn<() => Promise<void>>(() =>
      Promise.reject(new Error("simulated handler failure"))
    )
    render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={rejecting}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }))
    // The promise rejects on the microtask queue; flush before assertion.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(rejecting).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("renders step counter by default and hides it when showStepCounter=false", () => {
    const { rerender } = render(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
      />
    )
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()

    rerender(
      <WizardActions
        currentIndex={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
        showStepCounter={false}
      />
    )
    expect(screen.queryByText(/step 2 of 4/i)).not.toBeInTheDocument()
  })
})
