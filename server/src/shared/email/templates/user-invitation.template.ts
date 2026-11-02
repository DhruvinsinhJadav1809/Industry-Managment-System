import { UserInvitationTemplateOptions } from "../types/user-invitation-template";

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

export const buildUserInvitationTemplate = ({
  userName,
  setupLink,
}: UserInvitationTemplateOptions): string => {
  const safeSetupLink = escapeHtml(setupLink);
  const safeUserName = escapeHtml(userName);

  return `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>Set up your IMS account</title>
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
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  body { margin:0; padding:0; width:100% !important; height:100% !important; }
  a { text-decoration:none; }
  .btn:hover { background-color:#1c3f5f !important; }

  @media screen and (max-width:600px) {
    .email-container { width:100% !important; }
    .fluid-padding { padding-left:20px !important; padding-right:20px !important; }
  }

  @media (prefers-color-scheme:dark) {
    .bg-body { background-color:#0a1c2e !important; }
    .bg-card { background-color:#101f30 !important; }
    .bg-header { background-color:#0e2a44 !important; }
    .text-primary { color:#f4f7f9 !important; }
    .text-secondary { color:#a7bdc9 !important; }
    .text-muted { color:#7999ab !important; }
    .border-soft { border-color:#23384a !important; }
    .link-fallback { color:#f6c377 !important; }
  }
</style>
</head>
<body class="bg-body" style="margin:0; padding:0; background-color:#f4f7f9; font-family:'Inter','Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f7f9;">
    You have been invited to IMS. Set your password within 12 hours.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-body" style="background-color:#f4f7f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="width:600px; max-width:600px;">
          <tr>
            <td class="bg-header" style="background-color:#0e2a44; border-radius:10px 10px 0 0; padding:28px 32px;">
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
          <tr>
            <td style="background-color:#f0a93a; height:3px; line-height:3px; font-size:1px;">&nbsp;</td>
          </tr>
          <tr>
            <td class="bg-card border-soft" style="background-color:#ffffff; border:1px solid #e6edf1; border-top:none; border-radius:0 0 10px 10px; padding:40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fluid-padding">
                <tr>
                  <td>
                    <p style="margin:0 0 4px; font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#e0932a;">
                      Account onboarding
                    </p>
                    <h1 class="text-primary" style="margin:0 0 20px; font-family:'Space Grotesk','Segoe UI',Arial,sans-serif; font-size:24px; line-height:1.3; font-weight:700; color:#101828;">
                      You are invited to IMS
                    </h1>
                    <p class="text-secondary" style="margin:0 0 16px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.6; color:#384f60;">
                      Hi ${safeUserName},
                    </p>
                    <p class="text-secondary" style="margin:0 0 28px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.6; color:#384f60;">
                      An administrator created an account for you in the <strong>Industry Management System</strong>. Set your password using the button below to activate your account. This link expires in <strong>12 hours</strong>.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:8px; background-color:#1c3f5f;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeSetupLink}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="14%" fillcolor="#1c3f5f" strokecolor="#1c3f5f">
                          <w:anchorlock/>
                          <center style="color:#f4f7f9;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Set your password</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${safeSetupLink}" class="btn" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; font-weight:600; color:#f4f7f9; background-color:#1c3f5f; border-radius:8px; text-decoration:none;">
                            Set your password
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    <p class="text-muted" style="margin:28px 0 8px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:13px; line-height:1.6; color:#7999ab;">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                    <p style="margin:0; word-break:break-all; font-family:'JetBrains Mono','Courier New',monospace; font-size:12px; line-height:1.6;">
                      <a href="${safeSetupLink}" class="link-fallback" target="_blank" style="color:#1c3f5f; text-decoration:underline;">${safeSetupLink}</a>
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                      <tr>
                        <td class="border-soft" style="border-top:1px solid #e6edf1; padding-top:24px;">
                          <p class="text-muted" style="margin:0 0 8px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:13px; line-height:1.6; color:#7999ab;">
                            If you were not expecting this invitation, you can ignore this email. Your account will not be activated until you set a password.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 20px; font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:12px; line-height:1.6; color:#7999ab;">
              IMS &middot; Industry Management System<br />
              This is an automated message. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
