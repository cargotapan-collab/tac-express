import * as React from "react"

import type { FailedWhatsappSendRow } from "@workspace/types"

import { FailedSendsTable } from "../../whatsapp/failed-sends-table"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsCard } from "../ops-card"

/**
 * Page-shape view for the WhatsApp failed-sends operator triage page
 * (backlog item W2 — issue #142, PR 1 of 2 — the visibility/read half;
 * PR 2 adds the retry button per the brief's read/retry split).
 *
 * Pure — receives the row set as a prop and composes the existing
 * OpsFrame / OpsPageHead / OpsCard shells + the FailedSendsTable.
 * Zero data fetch, zero callbacks emitted upward (PR 1 has no
 * interactive controls). LAW 6 + LAW 7 respected.
 *
 * Sub-title surfaces the time window so an operator knows the cutoff
 * without having to read the service code or page query string.
 */

interface OpsWhatsAppFailedSendsViewProps {
  rows: FailedWhatsappSendRow[]
  /**
   * Number of days back the underlying query covered. Defaults to the
   * service-level default (7) so the page can pass the value through
   * without computing it twice.
   */
  windowDays?: number
}

function OpsWhatsAppFailedSendsView({
  rows,
  windowDays = 7,
}: OpsWhatsAppFailedSendsViewProps) {
  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="WhatsApp"
        title="Failed sends"
        sub={`Most-recent ${windowDays}-day window. ${rows.length} failed send${rows.length === 1 ? "" : "s"}.`}
      />
      <OpsCard pad="lg">
        <FailedSendsTable rows={rows} />
      </OpsCard>
    </OpsFrame>
  )
}

export { OpsWhatsAppFailedSendsView }
export type { OpsWhatsAppFailedSendsViewProps }
