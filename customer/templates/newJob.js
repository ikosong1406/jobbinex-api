const NewJob= (firstname, jobTitle, company, isFreePlan = false) => {
  const subscribeSection = isFreePlan
    ? `
      <div style="margin-top: 24px; padding: 16px; background-color: #f4f8ff; border: 1px solid #cfe0ff; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;">
          Want your assistant to apply to <strong>more jobs</strong> for you? Upgrade your plan to unlock more applications.
        </p>
        <a href="${process.env.FRONTEND_URL}/profile"
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Subscribe Now
        </a>
      </div>
    `
    : `
      <p style="margin-top: 20px; color: #4b5563; font-size: 14px;">
        Your assistant will continue applying to jobs on your behalf. 
      </p>
    `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Job Application</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                     style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <tr>
                  <td style="background-color: #2563eb; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px;">New Job Application</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">
                      Hi ${firstname || "there"},
                    </p>
                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      Great news! Your assistant has submitted a new job application on your behalf.
                    </p>

                    <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 15px;">
                        <strong>Position:</strong> ${jobTitle}
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px;">
                        <strong>Company:</strong> ${company}
                      </p>
                    </div>

                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      Log in to your dashboard to view the application details, track its status, and manage your job applications.
                    </p>

                    ${subscribeSection}

                    <p style="margin-top: 28px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      You're receiving this email because you have an active account with Jobbinex.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 16px; text-align: center;">
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

export default NewJob;