import * as React from "react"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { OpsManagementView } from "./ops-management-view"
import type { StaffRow } from "./ops-management-view"

const ROW_OWNER: StaffRow = {
  name: "OWNER USER",
  email: "owner@tac.example",
  role: "SUPER_ADMIN",
  hub: "IMPHAL",
  active: true,
}

const ROW_OPERATOR: StaffRow = {
  name: "OPERATOR USER",
  email: "ops@tac.example",
  role: "OPERATOR",
  hub: "NEW_DELHI",
  active: true,
}

const BASE_PROPS = {
  totalStaff: 2,
  active: 2,
  inactive: 0,
  hubsCovered: 2,
  staff: [ROW_OWNER, ROW_OPERATOR],
}

describe("OpsManagementView", () => {
  it("renders the page heading", () => {
    render(<OpsManagementView {...BASE_PROPS} />)
    expect(
      screen.getByRole("heading", { level: 1, name: /operations & access/i }),
    ).toBeInTheDocument()
  })

  it("renders one row per staff entry", () => {
    render(<OpsManagementView {...BASE_PROPS} />)
    expect(screen.getByText("owner@tac.example")).toBeInTheDocument()
    expect(screen.getByText("ops@tac.example")).toBeInTheDocument()
  })

  describe("Invite Staff button (per #54)", () => {
    it("disables the button when no onInvite is provided", () => {
      render(<OpsManagementView {...BASE_PROPS} />)
      const button = screen.getByRole("button", { name: /invite staff/i })
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute("title", "Invite flow not wired by parent")
    })

    it("calls onInvite when clicked", () => {
      const onInvite = vi.fn()
      render(<OpsManagementView {...BASE_PROPS} onInvite={onInvite} />)
      const button = screen.getByRole("button", { name: /invite staff/i })
      expect(button).not.toBeDisabled()
      fireEvent.click(button)
      expect(onInvite).toHaveBeenCalledOnce()
    })
  })

  describe("Role select (per #54)", () => {
    it("renders the row's current role as the selected value", () => {
      render(<OpsManagementView {...BASE_PROPS} />)
      const select = screen.getByLabelText(
        /role for owner user/i,
      ) as HTMLSelectElement
      expect(select.value).toBe("SUPER_ADMIN")
    })

    it("calls onRoleChange with email + new role on change", () => {
      const onRoleChange = vi.fn()
      render(
        <OpsManagementView {...BASE_PROPS} onRoleChange={onRoleChange} />,
      )
      const select = screen.getByLabelText(/role for operator user/i)
      fireEvent.change(select, { target: { value: "SUPER_ADMIN" } })
      expect(onRoleChange).toHaveBeenCalledWith(
        "ops@tac.example",
        "SUPER_ADMIN",
      )
    })

    it("does not throw when onRoleChange is omitted (uncontrolled)", () => {
      render(<OpsManagementView {...BASE_PROPS} />)
      const select = screen.getByLabelText(/role for operator user/i)
      // Just verifying the optional callback path doesn't crash on change.
      expect(() =>
        fireEvent.change(select, { target: { value: "SUPER_ADMIN" } }),
      ).not.toThrow()
    })
  })
})
