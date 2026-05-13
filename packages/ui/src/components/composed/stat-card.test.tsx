import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, type Mock } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { StatCard } from "./stat-card"

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Active Shipments" value={127} />)
    expect(screen.getByText("Active Shipments")).toBeInTheDocument()
    expect(screen.getByText("127")).toBeInTheDocument()
  })

  it("applies mono numerals by default", () => {
    render(<StatCard label="Total" value={42} />)
    const value = screen.getByText("42")
    expect(value).toHaveClass("font-mono", "tabular-nums")
  })

  it("disables mono numerals when monoValue=false", () => {
    render(<StatCard label="Status" value="Active" monoValue={false} />)
    const value = screen.getByText("Active")
    expect(value).not.toHaveClass("font-mono")
  })

  describe("trend chip", () => {
    it("renders positive trend with success color and up arrow", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 2.5, direction: "up", since: "last week" }}
        />
      )
      const trend = screen.getByLabelText(/Increased by 2.5% since last week/i)
      expect(trend).toBeInTheDocument()
      expect(trend).toHaveClass("text-accent-success")
      expect(trend).toHaveAttribute("data-direction", "up")
    })

    it("renders negative trend with destructive color and down arrow", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 1.5, direction: "down", since: "yesterday" }}
        />
      )
      const trend = screen.getByLabelText(/Decreased by 1.5% since yesterday/i)
      expect(trend).toHaveClass("text-destructive")
      expect(trend).toHaveAttribute("data-direction", "down")
    })

    it("renders neutral trend with muted color and em-dash glyph", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 0, direction: "neutral" }}
        />
      )
      const trend = screen.getByLabelText(/No change/i)
      expect(trend).toHaveClass("text-muted-foreground")
      expect(trend).toHaveTextContent("—")
    })

    it("formats large percent without decimals", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 250, direction: "up" }}
        />
      )
      expect(screen.getByText("+250%")).toBeInTheDocument()
    })

    it("honors a pre-formatted label override", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 2, direction: "up", label: "▲ 2 pts" }}
        />
      )
      expect(screen.getByText("▲ 2 pts")).toBeInTheDocument()
    })
  })

  describe("interactivity", () => {
    it("exposes role=button when onClick is provided", () => {
      render(<StatCard label="X" value={1} onClick={() => {}} />)
      expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("omits role=button when onClick is not provided", () => {
      const { container } = render(<StatCard label="X" value={1} />)
      expect(container.querySelector('[role="button"]')).toBeNull()
    })

    it("fires onClick on click", () => {
      const onClick: Mock<() => void> = vi.fn<() => void>()
      render(<StatCard label="X" value={1} onClick={onClick} />)
      fireEvent.click(screen.getByRole("button"))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("fires onClick on Enter and Space", () => {
      const onClick: Mock<() => void> = vi.fn<() => void>()
      render(<StatCard label="X" value={1} onClick={onClick} />)
      const card = screen.getByRole("button")
      fireEvent.keyDown(card, { key: "Enter" })
      fireEvent.keyDown(card, { key: " " })
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it("ignores other keys", () => {
      const onClick: Mock<() => void> = vi.fn<() => void>()
      render(<StatCard label="X" value={1} onClick={onClick} />)
      fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" })
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe("visual slot", () => {
    it("renders the visual when provided and marks it aria-hidden", () => {
      const { container } = render(
        <StatCard
          label="X"
          value={1}
          visual={<svg data-testid="spark" />}
        />
      )
      expect(container.querySelector('[data-slot="stat-card-visual"]')).toHaveAttribute(
        "aria-hidden",
        "true"
      )
      expect(screen.getByTestId("spark")).toBeInTheDocument()
    })
  })

  describe("Violet Grid compliance", () => {
    it("does NOT apply rounded corners (LAW 13 — sharp only)", () => {
      const { container } = render(<StatCard label="X" value={1} />)
      const card = container.querySelector('[data-slot="stat-card"]')
      expect(card).not.toHaveClass(/^rounded-(?!none)/)
    })

    it("does NOT use raw green/red Tailwind colors (LAW 9 — token-only)", () => {
      render(
        <StatCard
          label="X"
          value={1}
          trend={{ value: 1, direction: "up" }}
        />
      )
      const trend = screen.getByLabelText(/Increased/i)
      expect(trend.className).not.toMatch(/text-(green|red|emerald|rose)-/)
    })

    it("exposes data-slot for downstream styling and querying", () => {
      const { container } = render(<StatCard label="X" value={1} />)
      expect(container.querySelector('[data-slot="stat-card"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="stat-card-label"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="stat-card-value"]')).toBeInTheDocument()
    })
  })

  describe("variants", () => {
    it.each(["default", "compact", "hero"] as const)(
      "renders without crashing for variant=%s",
      (variant) => {
        const { container } = render(
          <StatCard label="X" value={1} variant={variant} />
        )
        expect(container.querySelector('[data-slot="stat-card"]')).toHaveAttribute(
          "data-variant",
          variant
        )
      }
    )
  })
})
