import { OrderMailTemplateOptions } from "../types/order-mail-template";

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export const buildOrderEmailTemplate = ({
  customerName,
  orderNumber,
  event,
  items,
}: OrderMailTemplateOptions): string => {
  const eventCopy = {
    created: {
      label: "New customer order",
      heading: "A customer placed an order",
      description: "Review the requested items and quantities below.",
    },
    modified: {
      label: "Order updated",
      heading: "A customer modified an order",
      description: "Review the updated requested items and quantities below.",
    },
    cancelled: {
      label: "Order cancelled",
      heading: "A customer cancelled an order",
      description: "The order is no longer awaiting approval.",
    },
  }[event];

  const itemRows = items.map(
    (item) => `
        <tr>
          <td style="padding:12px 14px; border-bottom:1px solid #e6edf1; color:#a65d00; font-size:13px; font-weight:600;">${escapeHtml(item.productName)}</td>
          <td align="right" style="padding:12px 14px; border-bottom:1px solid #e6edf1; color:#a65d00; font-size:13px; font-weight:600;">${item.requestedQuantity}</td>
        </tr>`,
  );
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${eventCopy.label}: ${escapeHtml(orderNumber)}</title>
  <style>
    body { margin:0; padding:0; background:#f4f7f9; font-family:Arial,Helvetica,sans-serif; }
    @media (prefers-color-scheme: dark) {
      .email-body { background:#0a1c2e !important; }
      .email-card { background:#101f30 !important; border-color:#23384a !important; }
      .text-primary { color:#f4f7f9 !important; }
      .text-secondary { color:#a7bdc9 !important; }
    }
    @media screen and (max-width:600px) {
      .email-container { width:100% !important; }
      .email-padding { padding-left:20px !important; padding-right:20px !important; }
    }
  </style>
</head>
<body class="email-body" style="margin:0; padding:0; background:#f4f7f9;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px;">
    ${eventCopy.label}: ${escapeHtml(orderNumber)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-body" style="background:#f4f7f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="width:600px; max-width:600px;">
          <tr>
            <td style="padding:24px 30px; background:#0e2a44; border-radius:10px 10px 0 0;">
              <div style="font-size:18px; font-weight:700; color:#f4f7f9;">IMS</div>
              <div style="margin-top:3px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#a7bdc9;">Industry Management System</div>
            </td>
          </tr>
          <tr><td style="height:3px; background:#f0a93a; font-size:1px; line-height:3px;">&nbsp;</td></tr>
          <tr>
            <td class="email-card email-padding" style="padding:36px 30px; background:#ffffff; border:1px solid #e6edf1; border-top:0;">
              <p style="margin:0 0 6px; color:#e0932a; font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">${eventCopy.label}</p>
              <h1 class="text-primary" style="margin:0 0 16px; color:#101828; font-size:23px; line-height:1.3;">${eventCopy.heading}</h1>
              <p class="text-secondary" style="margin:0 0 8px; color:#384f60; font-size:14px; line-height:1.6;">Customer : ${escapeHtml(customerName)} OrderID:<strong>${escapeHtml(orderNumber)}</strong>.</p>
              <p class="text-secondary" style="margin:0 0 22px; color:#384f60; font-size:14px; line-height:1.6;">${eventCopy.description}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e6edf1; border-radius:6px; border-spacing:0;">
                <thead>
                  <tr>
                    <th align="left" style="padding:11px 14px; background:#f4f7f9; color:#446277; font-size:11px; letter-spacing:.5px; text-transform:uppercase;">Product</th>
                    <th align="right" style="padding:11px 14px; background:#f4f7f9; color:#446277; font-size:11px; letter-spacing:.5px; text-transform:uppercase;">Requested quantity</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 20px; text-align:center; color:#7999ab; font-size:12px; line-height:1.6;">
              IMS &middot; Industry Management System<br />This is an automated message. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
