import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"

import { useDesignVersion } from "./use-design-version"
import { DESIGN_FLAG_STORAGE_KEY } from "@workspace/ui/lib/design-flag"

function Probe() {
  const { version, setVersion } = useDesignVersion()
  return (
    <>
      <p data-testid="version">{version}</p>
      <button type="button" onClick={() => setVersion("v7")}>
        set v7
      </button>
    </>
  )
}

describe("useDesignVersion", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("resolves to v6 by default when no flag is set", () => {
    render(<Probe />)
    expect(screen.getByTestId("version")).toHaveTextContent("v6")
  })

  it("hydration-syncs the per-user override after mount", () => {
    // Seed before render — simulates a user who previously toggled.
    window.localStorage.setItem(DESIGN_FLAG_STORAGE_KEY, "v7")
    render(<Probe />)
    // Either the lazy initializer or the mount effect should land us on v7.
    expect(screen.getByTestId("version")).toHaveTextContent("v7")
  })

  it("setVersion persists to localStorage and updates state", () => {
    render(<Probe />)
    act(() => {
      screen.getByRole("button", { name: /set v7/i }).click()
    })
    expect(screen.getByTestId("version")).toHaveTextContent("v7")
    expect(window.localStorage.getItem(DESIGN_FLAG_STORAGE_KEY)).toBe("v7")
  })

  it("reacts to a foreign-tab storage event for the same key", () => {
    render(<Probe />)
    expect(screen.getByTestId("version")).toHaveTextContent("v6")

    act(() => {
      window.localStorage.setItem(DESIGN_FLAG_STORAGE_KEY, "v7")
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: DESIGN_FLAG_STORAGE_KEY,
          newValue: "v7",
        })
      )
    })

    expect(screen.getByTestId("version")).toHaveTextContent("v7")
  })

  it("ignores storage events for unrelated keys", () => {
    render(<Probe />)
    act(() => {
      window.localStorage.setItem("some-other-key", "v7")
      window.dispatchEvent(
        new StorageEvent("storage", { key: "some-other-key", newValue: "v7" })
      )
    })
    expect(screen.getByTestId("version")).toHaveTextContent("v6")
  })
})
