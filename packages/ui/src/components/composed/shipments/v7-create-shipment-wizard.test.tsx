import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, act } from "@testing-library/react"

import { V7CreateShipmentWizard } from "./v7-create-shipment-wizard"
import {
  SHIPMENT_DRAFT_STORAGE_KEY,
  SHIPMENT_DRAFT_SCHEMA_VERSION,
} from "../../../hooks/use-shipment-draft"
import type { CreateShipmentInput } from "./create-shipment-schema"

const seedDraft = (values: Partial<CreateShipmentInput>) => {
  window.localStorage.setItem(
    SHIPMENT_DRAFT_STORAGE_KEY,
    JSON.stringify({
      version: SHIPMENT_DRAFT_SCHEMA_VERSION,
      savedAt: Date.now(),
      values,
    }),
  )
}

describe("V7CreateShipmentWizard", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders the Sender step by default with the wizard stepper visible", () => {
    render(<V7CreateShipmentWizard onSubmit={vi.fn()} />)

    // Sender step is the first one — its labels render.
    expect(screen.getByLabelText(/sender name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sender phone/i)).toBeInTheDocument()

    // Receiver step is NOT yet rendered.
    expect(screen.queryByLabelText(/receiver name/i)).not.toBeInTheDocument()
  })

  it("hydrates form fields from a draft in localStorage on mount", () => {
    seedDraft({
      senderName: "Alice From Imphal",
      senderPhone: "9876543210",
    })

    render(<V7CreateShipmentWizard onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/sender name/i)).toHaveValue(
      "Alice From Imphal",
    )
    expect(screen.getByLabelText(/sender phone/i)).toHaveValue("9876543210")
  })

  it("blocks Next when the current step has invalid fields and surfaces zod errors", async () => {
    const onSubmit = vi.fn()
    render(<V7CreateShipmentWizard onSubmit={onSubmit} />)

    // Click Next without filling anything.
    await act(async () => {
      screen.getByRole("button", { name: /next/i }).click()
    })

    // Zod error for sender name surfaces (min length 2).
    expect(await screen.findByText(/name required/i)).toBeInTheDocument()

    // Still on Sender step — Receiver fields not rendered.
    expect(screen.queryByLabelText(/receiver name/i)).not.toBeInTheDocument()

    // onSubmit must not have been called.
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("disables the submit button while the parent reports isLoading", () => {
    render(<V7CreateShipmentWizard onSubmit={vi.fn()} isLoading />)

    // The wizard's primary action button is disabled while loading.
    // (We don't hard-assert the label since WizardActions controls it; we
    // assert the disabled state of the only enabled action in the footer.)
    const buttons = screen.getAllByRole("button")
    const primary = buttons.find((b) => b.textContent?.toLowerCase().includes("…"))
    expect(primary ?? buttons[buttons.length - 1]).toBeDisabled()
  })
})
