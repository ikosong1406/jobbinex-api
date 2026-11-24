
const EmailTemplate = ({
  type = "general",
  firstname = "there",
  jobTitle = "",
  company = "",
  isFreePlan = false,
  resetCode = "",
  adminMessage = "",
  planName = "",
  amountPaid = "",
  expiresAt = "",
  actionUrl = process.env.CLIENT_URL || "https://app.jobbinex.com",
}) => {
  // --- Theme Colors ---
  const colors = {
    darkGreen: "#14251a",
    limeGreen: "#4eaa3c",
    limeGreenLight: "rgba(78, 170, 60, 0.15)",
    softBg: "#f4f6f4",
    textMain: "#111827",
    textMuted: "#4b5563",
    white: "#ffffff",
    border: "#e5e7eb",
  };

  // --- Dynamic Content Configuration ---
  let headerTitle = "Notification";
  let bodyContent = "";
  let ctaText = "Go to Dashboard";
  let ctaLink = `${actionUrl}/dashboard`;

  // 1. Welcome Email
  if (type === "welcome") {
    headerTitle = "Welcome to Jobbinex!";
    bodyContent = `
      <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 16px;">Hi ${firstname},</p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        Welcome to Jobbinex! We're thrilled to have you on board.
      </p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        We know your time is valuable. That's why we've assigned a dedicated job assistant to work behind the scenes—sourcing roles, tailoring your applications, and submitting them on your behalf while you focus on your career and life.
      </p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        To get the most out of your assistant, please complete your profile so they can start matching you with the right opportunities.
      </p>
    `;
    ctaText = "Complete Your Profile";
    ctaLink = `${actionUrl}/profile`;
  }

  // 2. New Job Application
  else if (type === "newJob") {
    headerTitle = "New Application Submitted";
    bodyContent = `
      <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 16px;">Hi ${firstname},</p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        Your dedicated assistant has been hard at work. They've just submitted a new job application on your behalf.
      </p>

      <!-- Styled Assistant Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: ${colors.darkGreen}; background-image: radial-gradient(circle at top right, ${colors.limeGreenLight} 0%, transparent 50%); border-radius: 16px; margin: 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 32px 24px; text-align: center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto; background-color: ${colors.limeGreen}; border-radius: 20px;">
              <tr>
                <td style="padding: 6px 16px;">
                  <span style="color: ${colors.white}; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Application Submitted</span>
                </td>
              </tr>
            </table>
            <h2 style="margin: 0 0 8px 0; color: ${colors.white}; font-size: 22px; font-weight: 600;">${jobTitle}</h2>
            <p style="margin: 0; color: #d1d5db; font-size: 15px;">at ${company}</p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        You don't need to do anything right now. Log in to your dashboard to view the details and track the status of this application.
      </p>
    `;

    ctaText = "View Application Details";
    ctaLink = `${actionUrl}/jobs`;

    if (isFreePlan) {
      bodyContent += `
        <div style="margin-top: 24px; padding: 20px; background-color: ${colors.softBg}; border: 1px solid ${colors.border}; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 14px; line-height: 1.5;">
            On the Free plan, your assistant has a limited number of applications per month. <strong>Upgrade to unlock more applications</strong> and get closer to your next role.
          </p>
          <a href="${actionUrl}/profile" style="display: inline-block; padding: 12px 24px; background-color: ${colors.limeGreen}; color: ${colors.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Upgrade Plan</a>
        </div>
      `;
    }
  }

  // 3. Password Reset
  else if (type === "resetPassword") {
    headerTitle = "Reset Your Password";
    bodyContent = `
      <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 16px;">Hi ${firstname},</p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        We received a request to reset the password for your Jobbinex account. Use the verification code below to proceed.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: ${colors.softBg}; border: 2px dashed ${colors.limeGreen}; border-radius: 12px; margin: 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 24px; text-align: center;">
            <p style="margin: 0 0 8px 0; color: ${colors.textMuted}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
            <h1 style="margin: 0; color: ${colors.darkGreen}; font-size: 36px; letter-spacing: 6px; font-weight: bold;">${resetCode}</h1>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your account is still secure.
      </p>
    `;

    ctaText = "Return to Login";
    ctaLink = `${actionUrl}/login`;
  }

  // 4. Subscription Activated
  else if (type === "subscription") {
    headerTitle = "Subscription Activated";
    bodyContent = `
      <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 16px;">Hi ${firstname},</p>
      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        Thank you for subscribing to Jobbinex! Your <strong>${planName}</strong> plan is now active, and your dedicated job assistant is ready to get to work.
      </p>

      <!-- Subscription Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: ${colors.darkGreen}; background-image: radial-gradient(circle at top right, ${colors.limeGreenLight} 0%, transparent 50%); border-radius: 16px; margin: 24px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="padding-bottom: 12px; color: #d1d5db; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Plan</td>
                <td style="padding-bottom: 12px; color: ${colors.white}; font-size: 15px; font-weight: 600; text-align: right;">${planName}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; color: #d1d5db; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
                <td style="padding-bottom: 12px; color: ${colors.white}; font-size: 15px; font-weight: 600; text-align: right;">${amountPaid}</td>
              </tr>
              <tr>
                <td style="color: #d1d5db; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Active Until</td>
                <td style="color: ${colors.limeGreen}; font-size: 15px; font-weight: 600; text-align: right;">${expiresAt}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: 15px; line-height: 1.6;">
        Your assistant will now begin sourcing and applying to roles on your behalf. You can sit back and focus on what matters most—we'll handle the busywork.
      </p>
    `;

    ctaText = "View Your Dashboard";
    ctaLink = `${actionUrl}/dashboard`;
  }

  // 5. General Admin Message
  else {
    headerTitle = "Message from Jobbinex";
    bodyContent = `
      <p style="margin: 0 0 16px 0; color: ${colors.textMain}; font-size: 16px;">Hi ${firstname},</p>
      <div style="color: ${colors.textMuted}; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        ${adminMessage || "<p>This is a general notification from the Jobbinex team.</p>"}
      </div>
    `;
  }

  // --- Base Template ---
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${headerTitle}</title>

        <style>
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }

          table {
            border-spacing: 0;
          }

          @media only screen and (max-width: 480px) {
            .email-body {
              padding: 24px 18px !important;
            }

            .email-header {
              padding: 22px 16px !important;
            }

            .email-footer {
              padding: 18px 12px !important;
            }
          }
        </style>
      </head>

      <body style="margin: 0; padding: 0; width: 100%; background-color: ${colors.softBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

        <!-- Full-width Email Wrapper -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0; padding: 0; border-collapse: collapse; background-color: ${colors.softBg};">
          <tr>
            <td align="center" style="padding: 0; margin: 0;">

              <!-- Main Email Container -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: none; margin: 0; padding: 0; border: 0; border-collapse: collapse; background-color: ${colors.white};">

                <!-- Header -->
                <tr>
                  <td class="email-header" style="background-color: ${colors.darkGreen}; padding: 24px 20px; text-align: center; border-bottom: 4px solid ${colors.limeGreen};">
                    <img
                      src="https://res.cloudinary.com/hrswxean/image/upload/v1795349160/logo1.png"
                      alt="Jobbinex"
                      width="160"
                      style="display: block; margin: 0 auto; max-width: 160px; width: 160px; height: auto; border: 0;"
                    />
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td class="email-body" style="padding: 28px 24px;">

                    <h1 style="margin: 0 0 24px 0; color: ${colors.darkGreen}; font-size: 24px; font-weight: 700; border-bottom: 2px solid ${colors.limeGreen}; padding-bottom: 12px; display: inline-block;">
                      ${headerTitle}
                    </h1>

                    ${bodyContent}

                    <!-- Primary CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="background-color: ${colors.limeGreen}; border-radius: 8px;">
                          <a href="${ctaLink}" style="display: inline-block; padding: 14px 32px; color: ${colors.white}; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                            ${ctaText}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid ${colors.border}; margin: 40px 0 24px 0;" />

                    <p style="margin: 0; color: ${colors.textMuted}; font-size: 12px; line-height: 1.5; text-align: center;">
                      You're receiving this email because you have an active account with Jobbinex.<br />
                      If you have any questions, reply to this email.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="email-footer" style="background-color: ${colors.darkGreen}; padding: 20px 16px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: ${colors.white}; font-size: 14px; font-weight: bold; letter-spacing: 0.5px;">
                      Jobbinex
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Jobbinex. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
    </html>
  `;
};

export default EmailTemplate;
