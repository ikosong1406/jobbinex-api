// Define the brand styles and platform info
const PRIMARY_COLOR = "#4eaa3c";
const SECONDARY_COLOR = "#d2d6db";
const WHITE_COLOR = "#ffffff";
const BLACK_COLOR = "#090d06";
const PLATFORM_NAME = "Jobbinex";

const Welcome = (firstname) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: ${SECONDARY_COLOR}; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${WHITE_COLOR}; border-radius: 8px; overflow: hidden; }
        .header { background-color: ${PRIMARY_COLOR}; padding: 20px 30px; text-align: center; }
        .logo { max-width: 150px; height: auto; display: block; margin: 0 auto; }
        .header h1 { color: ${WHITE_COLOR}; font-size: 24px; margin: 10px 0 0 0; font-weight: 600; }
        .content { padding: 40px 30px; color: ${BLACK_COLOR}; line-height: 1.6; }
        .content h2 { color: ${PRIMARY_COLOR}; font-size: 22px; margin-top: 0; font-weight: 600; }
        .button-container { text-align: center; margin-top: 30px; margin-bottom: 20px; }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: ${PRIMARY_COLOR};
            color: ${WHITE_COLOR} !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            font-size: 16px;
            border: 1px solid ${PRIMARY_COLOR};
        }
        .footer { background-color: ${SECONDARY_COLOR}; padding: 20px 30px; text-align: center; font-size: 12px; color: #555555; }
    </style>
</head>
<body>
    <div style="padding: 20px 0;">
        <div class="container">
            <div class="header">
                <img src="[YOUR_LOGO_URL]" alt="${PLATFORM_NAME} Logo" class="logo">
                <h1>Welcome to ${PLATFORM_NAME}!</h1>
            </div>

            <div class="content">
                <h2>Hello ${firstname},</h2>
                <p>Thank you for joining ${PLATFORM_NAME}. We are the platform where busy, ambitious professionals can outsource their entire job application process to our team of trained experts.</p>

                <p>Focus on your current career, and let us handle the tedious part of finding your next role. Your dedicated professional is ready to begin.</p>

                <div class="button-container">
                    <a href="https://app.jobbinex.com" class="button">Access Your Jobbinex Dashboard</a>
                </div>

                <p>We look forward to helping you land your dream job!</p>

                <p>Best regards,<br>The ${PLATFORM_NAME} Team</p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
                <p><a href="https://jobbinex.com">Visit Website</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

export default Welcome;
