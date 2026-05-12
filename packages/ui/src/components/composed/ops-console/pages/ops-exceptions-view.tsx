import * as React from "react"

import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import {
  OpsTable,
  OpsTableHead,
  OpsTableBody,
  OpsTableRow,
  OpsTableHeader,
  OpsTableCell,
} from "../ops-table"

interface ExceptionRow {
  awb: string
  status: string
  sender: string
  receiver: string
  route: string
}

interface OpsExceptionsViewProps {
  rows: ExceptionRow[]
}

function OpsExceptionsView({ rows }: OpsExceptionsViewProps) {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Operations"
        title="Exceptions"
        sub="Shipment exceptions requiring attention"
      />
      <OpsTable>
        <OpsTableHead>
          <tr>
            <OpsTableHeader>AWB</OpsTableHeader>
            <OpsTableHeader>Status</OpsTableHeader>
            <OpsTableHeader>Sender</OpsTableHeader>
            <OpsTableHeader>Receiver</OpsTableHeader>
            <OpsTableHeader>Route</OpsTableHeader>
          </tr>
        </OpsTableHead>
        <OpsTableBody>
          {rows.length === 0 ? (
            <OpsTableRow>
              <OpsTableCell
                colSpan={5}
                muted
                className="text-center py-8"
              >
                No exceptions — all clear
              </OpsTableCell>
            </OpsTableRow>
          ) : (
            rows.map((r) => (
              <OpsTableRow key={r.awb}>
                <OpsTableCell>
                  <span className="paper-id">{r.awb}</span>
                </OpsTableCell>
                <OpsTableCell mono>{r.status}</OpsTableCell>
                <OpsTableCell>{r.sender}</OpsTableCell>
                <OpsTableCell>{r.receiver}</OpsTableCell>
                <OpsTableCell mono>{r.route}</OpsTableCell>
              </OpsTableRow>
            ))
          )}
        </OpsTableBody>
      </OpsTable>
    </OpsFrame>
  )
}

export { OpsExceptionsView }
export type { OpsExceptionsViewProps, ExceptionRow }
