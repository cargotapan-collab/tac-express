import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import { OpsAccessFallback } from "./ops-access-fallback"

describe("OpsAccessFallback", () => {
  it("renders the unauthenticated copy", () => {
    render(<OpsAccessFallback reason="unauthenticated" />)
    expect(screen.getByText("Sign in required.")).toBeInTheDocument()
    expect(
      screen.getByText("This view is only available to signed-in operators."),
    ).toBeInTheDocument()
  })

  it("renders the forbidden copy with the required role when provided", () => {
    render(<OpsAccessFallback reason="forbidden" requiredRole="MANAGER" />)
    expect(screen.getByText("Not authorized.")).toBeInTheDocument()
    expect(
      screen.getByText("This view requires MANAGER role or above."),
    ).toBeInTheDocument()
  })

  it("renders the forbidden copy with generic body when role is omitted", () => {
    render(<OpsAccessFallback reason="forbidden" />)
    expect(screen.getByText("This view requires a higher role.")).toBeInTheDocument()
  })

  it("annotates the root with data-reason for downstream styling/hooks", () => {
    const { container } = render(<OpsAccessFallback reason="forbidden" />)
    const root = container.querySelector('[data-slot="ops-access-fallback"]')
    expect(root).not.toBeNull()
    expect(root?.getAttribute("data-reason")).toBe("forbidden")
  })

  it("uses semantic tokens only (no Tailwind color classes for paper UI)", () => {
    const { container } = render(<OpsAccessFallback reason="unauthenticated" />)
    const root = container.querySelector('[data-slot="ops-access-fallback"]') as HTMLElement
    // LAW 10 negative assertion — no raw color palette classes.
    expect(root.className).not.toMatch(/\bbg-red-\d+\b/)
    expect(root.className).not.toMatch(/\btext-red-\d+\b/)
    expect(root.className).not.toMatch(/\bbg-gray-\d+\b/)
  })
})
