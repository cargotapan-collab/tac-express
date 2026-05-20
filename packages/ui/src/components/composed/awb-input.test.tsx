import { describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { AwbInput } from "./awb-input"

function setup(overrides: Partial<React.ComponentProps<typeof AwbInput>> = {}) {
  const onChange = vi.fn()
  const onSubmit = vi.fn()
  const props = {
    value: "",
    onChange,
    onSubmit,
    ...overrides,
  }
  const utils = render(<AwbInput {...props} />)
  return { onChange, onSubmit, ...utils }
}

describe("<AwbInput>", () => {
  it("renders the accessible label + placeholder", () => {
    setup({ placeholder: "ENTER AWB / CARGO ID..." })
    const input = screen.getByLabelText(/AWB or cargo ID/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute("placeholder", "ENTER AWB / CARGO ID...")
  })

  it("fires onChange with the raw input value", () => {
    const { onChange } = setup()
    fireEvent.change(screen.getByLabelText(/AWB or cargo ID/i), {
      target: { value: "tac123" },
    })
    expect(onChange).toHaveBeenCalledWith("tac123")
  })

  it("fires onSubmit with the trimmed + uppercased value on submit", () => {
    const { onSubmit } = setup({ value: "  tac12345678  " })
    // Submit via the form (the submit button triggers it).
    fireEvent.submit(screen.getByLabelText(/AWB or cargo ID/i).closest("form")!)
    expect(onSubmit).toHaveBeenCalledWith("TAC12345678")
  })

  it("does not fire onSubmit while loading (held-Enter guard)", () => {
    const { onSubmit } = setup({ value: "tac12345678", loading: true })
    fireEvent.submit(screen.getByLabelText(/AWB or cargo ID/i).closest("form")!)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("auto-generates a stable id base when none is passed (no collisions)", () => {
    setup({ error: "bad" })
    const alert = screen.getByRole("alert")
    const input = screen.getByLabelText(/AWB or cargo ID/i)
    // The error id is derived from a generated base, not the literal "awb".
    expect(alert.id).toMatch(/-error$/)
    expect(input).toHaveAttribute("aria-describedby", alert.id)
  })

  it("hero size renders the LOCATE button + STANDBY chip", () => {
    setup({ size: "hero" })
    expect(screen.getByRole("button", { name: /locate/i })).toBeInTheDocument()
    expect(screen.getByText("STANDBY")).toBeInTheDocument()
  })

  it("default size renders an icon-only submit (aria-label Track AWB), no STANDBY chip", () => {
    setup({ size: "default" })
    expect(screen.getByRole("button", { name: /track awb/i })).toBeInTheDocument()
    expect(screen.queryByText("STANDBY")).not.toBeInTheDocument()
  })

  it("loading disables the submit button + sets aria-busy", () => {
    setup({ size: "hero", loading: true })
    const btn = screen.getByRole("button", { name: /locating/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute("aria-busy", "true")
    // Under load, "LOCATING" appears in BOTH the status chip and the
    // button label — assert at least one is present.
    expect(screen.getAllByText("LOCATING").length).toBeGreaterThan(0)
  })

  it("error renders role=alert + wires aria-describedby + aria-invalid", () => {
    setup({ id: "awb-test", error: "Enter an AWB or cargo ID." })
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Enter an AWB or cargo ID.")
    expect(alert).toHaveAttribute("id", "awb-test-error")
    const input = screen.getByLabelText(/AWB or cargo ID/i)
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("aria-describedby", "awb-test-error")
  })

  it("no error → input has no aria-invalid / aria-describedby", () => {
    setup({ error: null })
    const input = screen.getByLabelText(/AWB or cargo ID/i)
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-describedby")
  })
})
