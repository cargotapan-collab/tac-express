import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, type Mock } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { Button } from "./button"

describe("Button", () => {
  it("renders the children as button text", () => {
    render(<Button>Press me</Button>)
    expect(screen.getByRole("button", { name: /press me/i })).toBeInTheDocument()
  })

  it("fires onClick when clicked", () => {
    const onClick: Mock<() => void> = vi.fn<() => void>()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("does not fire onClick when disabled", () => {
    const onClick: Mock<() => void> = vi.fn<() => void>()
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    )
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("exposes data-slot='button' for downstream styling", () => {
    render(<Button>X</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button")
  })

  it("forwards type attribute (defaults are inherited from the DOM)", () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
  })

  it("forwards ref to the underlying button element (React 19 ref-as-prop)", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>X</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it("merges custom className with variant classes", () => {
    render(<Button className="my-custom-class">X</Button>)
    expect(screen.getByRole("button")).toHaveClass("my-custom-class")
  })

  it("renders aria-invalid styling pass-through", () => {
    render(<Button aria-invalid="true">X</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true")
  })

  describe("asChild", () => {
    it("renders the child element type instead of <button>", () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      )
      const anchor = container.querySelector("a")
      expect(anchor).not.toBeNull()
      expect(anchor).toHaveAttribute("href", "/test")
      expect(container.querySelector("button")).toBeNull()
    })

    it("merges button classes onto the child", () => {
      const { container } = render(
        <Button asChild className="my-custom">
          <a href="/test">Link</a>
        </Button>
      )
      expect(container.querySelector("a")).toHaveClass("my-custom")
    })

    it("preserves data-slot on the child", () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      )
      expect(container.querySelector("a")).toHaveAttribute("data-slot", "button")
    })
  })

  describe("variants", () => {
    it.each(["default", "destructive", "outline", "secondary", "ghost", "link", "glow"] as const)(
      "renders without crashing for variant=%s",
      (variant) => {
        render(<Button variant={variant}>X</Button>)
        expect(screen.getByRole("button")).toBeInTheDocument()
      }
    )
  })

  describe("sizes", () => {
    it.each(["default", "sm", "lg", "icon"] as const)(
      "renders without crashing for size=%s",
      (size) => {
        render(<Button size={size}>X</Button>)
        expect(screen.getByRole("button")).toBeInTheDocument()
      }
    )
  })
})
