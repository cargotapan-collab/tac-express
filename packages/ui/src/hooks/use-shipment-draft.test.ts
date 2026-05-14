import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"

import {
  useShipmentDraft,
  SHIPMENT_DRAFT_STORAGE_KEY,
  SHIPMENT_DRAFT_SCHEMA_VERSION,
} from "./use-shipment-draft"

interface TestDraft {
  senderName: string
  receiverPhone: string
}

const FRESH_VALUES: TestDraft = {
  senderName: "Alice",
  receiverPhone: "9999999999",
}

describe("useShipmentDraft", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns null draft when localStorage is empty", () => {
    const { result } = renderHook(() => useShipmentDraft<TestDraft>())
    expect(result.current.draft).toBeNull()
  })

  it("hydrates draft from a fresh localStorage entry", () => {
    window.localStorage.setItem(
      SHIPMENT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: SHIPMENT_DRAFT_SCHEMA_VERSION,
        savedAt: Date.now(),
        values: FRESH_VALUES,
      }),
    )

    const { result } = renderHook(() => useShipmentDraft<TestDraft>())
    expect(result.current.draft).toEqual(FRESH_VALUES)
  })

  it("ignores and evicts a draft older than the 24h TTL", () => {
    const TWENTY_FIVE_HOURS_AGO = Date.now() - 25 * 60 * 60 * 1000
    window.localStorage.setItem(
      SHIPMENT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: SHIPMENT_DRAFT_SCHEMA_VERSION,
        savedAt: TWENTY_FIVE_HOURS_AGO,
        values: FRESH_VALUES,
      }),
    )

    const { result } = renderHook(() => useShipmentDraft<TestDraft>())

    expect(result.current.draft).toBeNull()
    // Stale entries are removed on read so a future visit doesn't pay the parse cost.
    expect(window.localStorage.getItem(SHIPMENT_DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("ignores a draft written under a different schema version", () => {
    window.localStorage.setItem(
      SHIPMENT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: SHIPMENT_DRAFT_SCHEMA_VERSION + 1,
        savedAt: Date.now(),
        values: FRESH_VALUES,
      }),
    )

    const { result } = renderHook(() => useShipmentDraft<TestDraft>())
    expect(result.current.draft).toBeNull()
  })

  it("returns null when localStorage contains corrupt JSON", () => {
    window.localStorage.setItem(SHIPMENT_DRAFT_STORAGE_KEY, "{not-json")
    const { result } = renderHook(() => useShipmentDraft<TestDraft>())
    expect(result.current.draft).toBeNull()
  })

  it("save() writes the values + version + timestamp after debounce", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useShipmentDraft<TestDraft>())

    act(() => {
      result.current.save(FRESH_VALUES)
    })

    // Pre-debounce: nothing written yet.
    expect(window.localStorage.getItem(SHIPMENT_DRAFT_STORAGE_KEY)).toBeNull()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    const raw = window.localStorage.getItem(SHIPMENT_DRAFT_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as {
      version: number
      savedAt: number
      values: TestDraft
    }
    expect(parsed.version).toBe(SHIPMENT_DRAFT_SCHEMA_VERSION)
    expect(parsed.values).toEqual(FRESH_VALUES)
    expect(parsed.savedAt).toBeGreaterThan(0)
  })

  it("save() coalesces rapid calls within the debounce window", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useShipmentDraft<TestDraft>())

    act(() => {
      result.current.save({ senderName: "A", receiverPhone: "1" })
      result.current.save({ senderName: "B", receiverPhone: "2" })
      result.current.save({ senderName: "C", receiverPhone: "3" })
      vi.advanceTimersByTime(500)
    })

    const parsed = JSON.parse(
      window.localStorage.getItem(SHIPMENT_DRAFT_STORAGE_KEY)!,
    ) as { values: TestDraft }
    expect(parsed.values).toEqual({ senderName: "C", receiverPhone: "3" })
  })

  it("clear() removes the draft immediately, no debounce", () => {
    window.localStorage.setItem(
      SHIPMENT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: SHIPMENT_DRAFT_SCHEMA_VERSION,
        savedAt: Date.now(),
        values: FRESH_VALUES,
      }),
    )

    const { result } = renderHook(() => useShipmentDraft<TestDraft>())
    expect(result.current.draft).toEqual(FRESH_VALUES)

    act(() => {
      result.current.clear()
    })

    expect(window.localStorage.getItem(SHIPMENT_DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("custom storageKey isolates drafts between hook instances", () => {
    vi.useFakeTimers()
    const { result: a } = renderHook(() =>
      useShipmentDraft<TestDraft>({ storageKey: "tac-test-draft-A" }),
    )
    const { result: b } = renderHook(() =>
      useShipmentDraft<TestDraft>({ storageKey: "tac-test-draft-B" }),
    )

    act(() => {
      a.current.save({ senderName: "AAA", receiverPhone: "111" })
      vi.advanceTimersByTime(500)
    })

    expect(window.localStorage.getItem("tac-test-draft-A")).not.toBeNull()
    expect(window.localStorage.getItem("tac-test-draft-B")).toBeNull()
    expect(b.current.draft).toBeNull()
  })

  it("survives a localStorage write failure without throwing", () => {
    vi.useFakeTimers()
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("QuotaExceededError")
      })

    const { result } = renderHook(() => useShipmentDraft<TestDraft>())

    expect(() => {
      act(() => {
        result.current.save(FRESH_VALUES)
        vi.advanceTimersByTime(500)
      })
    }).not.toThrow()

    setItemSpy.mockRestore()
  })
})
