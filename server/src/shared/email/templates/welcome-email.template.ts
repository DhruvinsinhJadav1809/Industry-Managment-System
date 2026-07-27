import { WelcomeTemplateOptions } from "../types/welcome-mail-template";

export const buildWelcomeTemplate = ({
  userName,
  loginLink = "#",
}: WelcomeTemplateOptions & { loginLink?: string }): string => {
  return `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>Welcome to IMS</title>
<!--[if mso]>
<noscript>
  <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
</noscript>
<style>
  table, td { font-family: Arial, Helvetica, sans-serif; }
</style>
<![endif]-->
<style>
  /* Progressive enhancement fonts — falls back to system sans everywhere else */
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }

  a { text-decoration: none; }

  .btn:hover { background-color: #1c3f5f !important; }

  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .fluid-padding { padding-left: 20px !important; padding-right: 20px !important; }
    .stack-note { padding: 20px !important; }
  }

  /* Dark-mode support */
  @media (prefers-color-scheme: dark) {
    .bg-body { background-color: #0a1c2e !important; }
    .bg-card { background-color: #101f30 !important; }
    .bg-header { background-color: #0e2a44 !important; }
    .text-primary { color: #f4f7f9 !important; }
    .text-secondary { color: #a7bdc9 !important; }
    .text-muted { color: #7999ab !important; }
    .border-soft { border-color: #23384a !important; }
    .bg-code { background-color: #16324c !important; }
    .link-fallback { color: #f6c377 !important; }
  }
</style>
</head>
<body class="bg-body" style="margin:0; padding:0; background-color:#f4f7f9; font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f7f9;">
    Welcome to Industry Management System — Your account has been created successfully.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-body" style="background-color:#f4f7f9;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="width:600px; max-width:600px;">

          <!-- Header / brand -->
          <tr>
            <td class="bg-header" style="background-color:#0e2a44; border-radius:10px 10px 0 0; padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="36" height="36" align="center" valign="middle" style="background-color:#1c3f5f; border:1px solid #3c6a90; border-radius:8px; font-family:'Space Grotesk','Segoe UI',Arial,sans-serif;">
                          <span style="color:#f0a93a; font-size:14px; font-weight:700;">&#9679;</span>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="font-family:'Space Grotesk','Segoe UI',Arial,sans-serif; font-size:18px; font-weight:700; color:#f4f7f9; line-height:1.1;">IMS</div>
                          <div style="font-family:'JetBrains Mono','Courier New',monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#7999ab; line-height:1.2; margin-top:2px;">Industry Mgmt.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="background-color:#f0a93a; height:3px; line-height:3px; font-size:1px;">&nbsp;</td>
          </tr>

          <!-- Card body -->
          <tr>
            <td class="bg-card border-soft" style="background-color:#ffffff; border:1px solid #e6edf1; border-top:none; border-radius:0 0 10px 10px; padding:40px 32px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fluid-padding">
                <tr>
                  <td>
                    <p style="margin:0 0 4px; font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#e0932a;">
                      Account Onboarding
                    </p>
                    <h1 class="text-primary" style="margin:0 0 20px; font-family:'Space Grotesk','Segoe UI',Arial,sans-serif; font-size:24px; line-height:1.3; font-weight:700; color:#101828;">
                      Welcome aboard! 🎉
                    </h1>

                    <p class="text-secondary" style="margin:0 0 16px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.6; color:#384f60;">
                      Hi ${userName},
                    </p>
                    <p class="text-secondary" style="margin:0 0 28px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.6; color:#384f60;">
                      Your account for the <strong>Industry Management System</strong> has been created successfully. You are all set to sign in and start accessing your workspace.
                    </p>

                    <!-- CTA button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:8px; background-color:#1c3f5f;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginLink}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="14%" fillcolor="#1c3f5f" strokecolor="#1c3f5f">
                          <w:anchorlock/>
                          <center style="color:#f4f7f9;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Log in to IMS</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${loginLink}" class="btn" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; font-weight:600; color:#f4f7f9; background-color:#1c3f5f; border-radius:8px; text-decoration:none;">
                            Log in to IMS
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>

                    <!-- Support / Footer note section -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                      <tr>
                        <td class="border-soft" style="border-top:1px solid #e6edf1; padding-top:24px;">
                          <p class="text-muted" style="margin:0; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:13px; line-height:1.6; color:#7999ab;">
                            If you have any questions or need assistance getting started, feel free to reach out to your system administrator.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="stack-note" style="padding:24px 32px; text-align:center;">
              <p style="margin:0 0 4px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:12px; color:#a7bdc9;">
                IMS &middot; Industry Management System
              </p>
              <p style="margin:0; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:12px; color:#a7bdc9;">
                This is an automated message — please don't reply to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};
