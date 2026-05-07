# TAC Express — WhatsApp / Chat Templates for Lemin AI

> **Target:** https://chat.leminai.com/templates/create
> **Scope:** customer-facing messages across the shipment, invoice, manifest,
> and booking lifecycle. Each template is a copy-paste artefact for Lemin AI's
> "Create template" form.

## How to use this document

For every template:

1. Copy the **Name** into Lemin AI's name field.
2. Pick the matching **Category** in Lemin AI's category dropdown (closest fit).
3. Copy the **Body** verbatim into Lemin's message field. Lemin's variable
   syntax is double-curly `{{variable}}` — already used here.
4. Register the **Variables** list in Lemin's variable manager so each one
   shows up as a fillable parameter when the template fires.
5. Use the **Source mapping** column when wiring the template to TAC Express
   data — it tells you which DB column / typed field supplies each variable
   at send time.

WhatsApp markup is supported: `*bold*`, `_italic_`, `~strikethrough~`, ` ``` mono ``` `.
Keep templates ≤ 1024 chars (WhatsApp's free-form session limit).

## Variable taxonomy

These variables recur across multiple templates — define them once in Lemin AI
and reuse:

| Variable | Source (TAC Express) | Example |
|---|---|---|
| `{{customer_name}}` | `customers.name` (first name token) | `Anjali` |
| `{{awb}}` | `shipments.awb_number` | `TAC1234567890` |
| `{{invoice_number}}` | `invoices.invoice_number` | `INV-2026-0451` |
| `{{tracking_url}}` | `${origin}/track/${awb}` | `https://app.tac.express/track/TAC1234567890` |
| `{{origin_hub}}` | `shipments.origin_hub` (display name) | `Imphal` |
| `{{dest_hub}}` | `shipments.dest_hub` (display name) | `New Delhi` |
| `{{service_level}}` | `shipments.service_level` (title-cased) | `Express` |
| `{{eta_date}}` | `manifests.departure_date + transit_days` | `12 May 2026` |
| `{{total_amount_inr}}` | INR-formatted `invoices.total_amount` | `₹2,415.00` |
| `{{balance_inr}}` | INR-formatted `invoices.balance` | `₹2,415.00` |
| `{{due_date}}` | INR locale `invoices.due_date` | `25 May 2026` |
| `{{exception_reason}}` | `exceptions.reason` (humanised) | `Wrong address` |
| `{{reschedule_url}}` | public reschedule deep-link | `https://app.tac.express/track/{awb}/reschedule` |
| `{{support_phone}}` | `process.env.SUPPORT_PHONE` | `+91 38522 41100` |
| `{{brand_name}}` | constant | `TAC Express` |

Use `{{customer_name}}` defensively — fall back to `Hello,` (no name) when the
customer record has no name on file.

---

## 1 · Booking confirmation

**Name:** `tac_booking_received`
**Category:** Bookings / Lifecycle
**Trigger:** A new public booking is submitted via the booking form.
**Variables:** `customer_name`, `booking_id`, `pickup_address`, `pickup_window`, `support_phone`, `brand_name`

```
Hello {{customer_name}},

We've received your *{{brand_name}}* booking.

• Reference: *{{booking_id}}*
• Pickup: {{pickup_address}}
• Window: {{pickup_window}}

Our dispatch desk will confirm the rider shortly. We'll message back once a rider is assigned.

Need to change something? Reply to this chat or call {{support_phone}}.

— {{brand_name}}
```

---

## 2 · Booking accepted (rider assigned)

**Name:** `tac_booking_accepted`
**Category:** Bookings / Lifecycle
**Trigger:** Operator marks the booking as accepted; rider's contact is known.
**Variables:** `customer_name`, `booking_id`, `pickup_window`, `rider_name`, `rider_phone`, `brand_name`

```
Hello {{customer_name}},

Good news — your *{{brand_name}}* booking *{{booking_id}}* has been accepted.

• Pickup window: {{pickup_window}}
• Rider: {{rider_name}}
• Rider phone: {{rider_phone}}

Please keep the parcel ready and the recipient address handy.

— {{brand_name}}
```

---

## 3 · Booking declined

**Name:** `tac_booking_declined`
**Category:** Bookings / Lifecycle
**Trigger:** Operator declines a booking with a reason.
**Variables:** `customer_name`, `booking_id`, `decline_reason`, `support_phone`, `brand_name`

```
Hello {{customer_name}},

We're sorry — we can't fulfil your booking *{{booking_id}}* at this time.

Reason: {{decline_reason}}

If you'd like us to re-attempt or quote an alternative service, reply here or call {{support_phone}}.

— {{brand_name}}
```

---

## 4 · Shipment created (AWB issued)

**Name:** `tac_shipment_created`
**Category:** Shipments / Lifecycle
**Trigger:** A shipment row is created and an AWB number is assigned.
**Variables:** `customer_name`, `awb`, `origin_hub`, `dest_hub`, `service_level`, `eta_date`, `tracking_url`, `brand_name`

```
Hello {{customer_name}},

Your *{{brand_name}}* shipment is in the system.

• AWB: *{{awb}}*
• Route: {{origin_hub}} → {{dest_hub}}
• Service: {{service_level}}
• Estimated delivery: {{eta_date}}

Track live:
{{tracking_url}}

We'll keep you posted at every hub scan.

— {{brand_name}}
```

---

## 5 · In transit (manifest departed)

**Name:** `tac_shipment_in_transit`
**Category:** Shipments / Lifecycle
**Trigger:** Manifest containing this AWB scanned out of origin hub.
**Variables:** `customer_name`, `awb`, `origin_hub`, `dest_hub`, `eta_date`, `tracking_url`, `brand_name`

```
Hello {{customer_name}},

Your shipment *{{awb}}* is now *in transit* from {{origin_hub}} to {{dest_hub}}.

Estimated arrival: {{eta_date}}
Live tracking: {{tracking_url}}

— {{brand_name}}
```

---

## 6 · Out for delivery

**Name:** `tac_shipment_out_for_delivery`
**Category:** Shipments / Lifecycle
**Trigger:** Last-mile rider scanned the shipment into "out for delivery".
**Variables:** `customer_name`, `awb`, `delivery_window`, `rider_name`, `rider_phone`, `brand_name`

```
Hello {{customer_name}},

Your shipment *{{awb}}* is *out for delivery* today.

• Window: {{delivery_window}}
• Rider: {{rider_name}}
• Rider phone: {{rider_phone}}

Please ensure someone is available at the address with a valid ID. The rider will call ahead before arriving.

— {{brand_name}}
```

---

## 7 · Delivered (POD captured)

**Name:** `tac_shipment_delivered`
**Category:** Shipments / Lifecycle
**Trigger:** POD signature captured; status transitions to DELIVERED.
**Variables:** `customer_name`, `awb`, `delivered_at`, `pod_url`, `brand_name`

```
Hello {{customer_name}},

Your shipment *{{awb}}* has been *delivered* on {{delivered_at}}. ✅

Proof of delivery:
{{pod_url}}

Thank you for choosing *{{brand_name}}*. If anything seems off, reply within 24 hours and we'll look into it right away.

— {{brand_name}}
```

---

## 8 · Delivery attempted (failed)

**Name:** `tac_delivery_attempted`
**Category:** Shipments / Exceptions
**Trigger:** Rider records a failed delivery attempt.
**Variables:** `customer_name`, `awb`, `attempt_reason`, `next_attempt_date`, `reschedule_url`, `brand_name`

```
Hello {{customer_name}},

We tried to deliver shipment *{{awb}}* today but were unable to.

Reason: {{attempt_reason}}
Next attempt: {{next_attempt_date}}

Need a different time, address, or pickup at our hub instead? Reschedule here:
{{reschedule_url}}

— {{brand_name}}
```

---

## 9 · Exception raised (delay / damage / address issue)

**Name:** `tac_shipment_exception`
**Category:** Shipments / Exceptions
**Trigger:** An exception row is created against the shipment.
**Variables:** `customer_name`, `awb`, `exception_reason`, `next_action`, `support_phone`, `brand_name`

```
Hello {{customer_name}},

There's an update on your shipment *{{awb}}* that needs your attention.

Issue: {{exception_reason}}
Our next step: {{next_action}}

We're on it. If you'd prefer a call from our desk, just reply *CALL ME* or dial {{support_phone}}.

— {{brand_name}}
```

---

## 10 · Address clarification request

**Name:** `tac_address_clarification`
**Category:** Shipments / Exceptions
**Trigger:** Rider couldn't locate the address; operator requests clarification.
**Variables:** `customer_name`, `awb`, `current_address`, `brand_name`

```
Hello {{customer_name}},

Our rider is having trouble locating the delivery address for *{{awb}}*.

We currently have: {{current_address}}

Could you reply with:
1. A nearby landmark
2. A reachable phone for the recipient
3. Apartment / floor / shop number, if any

Once we have these details, we'll re-attempt today.

— {{brand_name}}
```

---

## 11 · Invoice issued (the WhatsApp share button output)

**Name:** `tac_invoice_issued`
**Category:** Finance / Invoices
**Trigger:** Operator uses *Send via WhatsApp* on the invoice detail page (matches the in-app dialog at `send-invoice-whatsapp-dialog.tsx`).
**Variables:** `customer_name`, `invoice_number`, `awb`, `total_amount_inr`, `balance_inr`, `due_date`, `tracking_url`, `brand_name`

```
Hello {{customer_name}},

Here is your *{{brand_name}}* invoice:

• Invoice: *{{invoice_number}}*
• AWB: {{awb}}
• Total: {{total_amount_inr}}
• Balance due: *{{balance_inr}}*
• Due by: {{due_date}}

Track shipment:
{{tracking_url}}

Reply to this chat with any questions.

— {{brand_name}}
```

---

## 12 · Payment reminder (overdue)

**Name:** `tac_invoice_payment_reminder`
**Category:** Finance / Invoices
**Trigger:** Daily cron sweeps invoices where `status = ISSUED && due_date < today`.
**Variables:** `customer_name`, `invoice_number`, `balance_inr`, `days_overdue`, `pay_url`, `support_phone`, `brand_name`

```
Hello {{customer_name}},

A friendly reminder — invoice *{{invoice_number}}* with a balance of *{{balance_inr}}* is now {{days_overdue}} day(s) past due.

Pay securely:
{{pay_url}}

Already paid? Just reply with the UTR / reference number and we'll reconcile it.

Need help? Call {{support_phone}}.

— {{brand_name}}
```

---

## 13 · Payment received (receipt)

**Name:** `tac_invoice_payment_received`
**Category:** Finance / Invoices
**Trigger:** Payment is recorded against an invoice (full or partial).
**Variables:** `customer_name`, `invoice_number`, `amount_received_inr`, `balance_inr`, `payment_method`, `reference`, `brand_name`

```
Hello {{customer_name}},

We've received {{amount_received_inr}} against invoice *{{invoice_number}}*.

• Method: {{payment_method}}
• Reference: {{reference}}
• Remaining balance: {{balance_inr}}

Thank you. A receipt will be emailed to you shortly.

— {{brand_name}}
```

---

## 14 · Manifest dispatch (B2B / partner-facing)

**Name:** `tac_manifest_dispatched`
**Category:** Operations / Manifests
**Trigger:** Operator confirms manifest departure for a partner / hub.
**Variables:** `partner_name`, `manifest_id`, `origin_hub`, `dest_hub`, `awb_count`, `total_weight`, `eta_date`, `brand_name`

```
Hello {{partner_name}},

Manifest *{{manifest_id}}* has been dispatched.

• Route: {{origin_hub}} → {{dest_hub}}
• AWBs: {{awb_count}}
• Total weight: {{total_weight}} kg
• Expected arrival: {{eta_date}}

Manifest sheet attached. Please confirm receipt on arrival.

— {{brand_name}} Dispatch
```

---

## Tone & policy notes

- **Plain text first.** No emoji except where they carry information (`✅` for delivery confirmation only).
- **Indian English.** "Pickup" not "Collection"; "delivery" not "shipping".
- **No legal / compliance text in templates.** Privacy-policy / T&Cs links live in your account footer in Lemin AI, not inside the message body.
- **Names.** Use only the first name token — `Anjali Sharma` → `{{customer_name}}` resolves to `Anjali`. The DB stores the full name; do the split at template-fill time.
- **Currency.** All amounts use `₹` and `en-IN` grouping (`₹1,23,456.00`). Pre-format in the application before substitution.
- **Phone display.** Keep the `+91 ` prefix and a single space between groups — readable and click-to-call friendly on mobile.
- **Reply paths.** Every customer-facing template ends with a clear way to respond — either in-chat reply or a phone number.

## Wiring in TAC Express

When a state transition fires, a service-layer helper resolves the right template
+ variables and ships them to Lemin via Lemin's send-template API:

```
packages/services/src/notifications/whatsapp-templates.ts
  ├── TEMPLATE_REGISTRY  →  { tac_shipment_created: { id, requiredVars }, ... }
  ├── resolveVariables(shipment | invoice | booking)  →  Record<string, string>
  └── sendTemplate(templateName, recipientPhone, vars)  →  Lemin AI HTTP call
```

The 14 templates above cover every customer-facing event currently emitted by
the dashboard. Add to this set sparingly — every new template is operational
overhead in Lemin's UI and another translation surface for future locales.
