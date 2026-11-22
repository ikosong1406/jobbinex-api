// Define the brand styles and platform info
const PRIMARY_COLOR = "#4eaa3c";
const SECONDARY_COLOR = "#d2d6db";
const WHITE_COLOR = "#ffffff";
const BLACK_COLOR = "#090d06";
const PLATFORM_NAME = "Jobbinex";

const Reset = (firstname, resetCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${SECONDARY_COLOR}; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${WHITE_COLOR}; border-radius: 8px; overflow: hidden; }
        .header { background-color: ${PRIMARY_COLOR}; padding: 20px 30px; text-align: center; }
        .logo { max-width: 150px; height: auto; display: block; margin: 0 auto; }
        .header h1 { color: ${WHITE_COLOR}; font-size: 24px; margin: 10px 0 0 0; font-weight: 600; }
        .content { padding: 40px 30px; color: ${BLACK_COLOR}; line-height: 1.6; }
        .content h2 { color: ${PRIMARY_COLOR}; font-size: 22px; margin-top: 0; font-weight: 600; }
        .reset-code { 
            display: inline-block; 
            padding: 15px 25px; 
            background-color: ${SECONDARY_COLOR}; 
            color: ${BLACK_COLOR}; 
            font-size: 24px; 
            font-weight: bold; 
            letter-spacing: 5px; 
            border-radius: 4px; 
            margin: 20px 0; 
            border: 2px dashed ${PRIMARY_COLOR};
        }
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
        .note { font-size: 14px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div style="padding: 20px 0;">
        <div class="container">
            <div class="header">
                <img src="[YOUR_LOGO_URL]" alt="${PLATFORM_NAME} Logo" class="logo">
                <h1>Password Reset Code</h1>
            </div>

            <div class="content">
                <h2>Hello ${firstname},</h2>
                <p>You requested a password reset for your ${PLATFORM_NAME} account. Here is your verification code:</p>
                
                <div style="text-align: center;">
                    <div class="reset-code">${resetCode}</div>
                </div>

                <p class="note"><strong>Note:</strong> This code will expire in 10 minutes for security reasons.</p>

                <p>If you didn't request this reset, please ignore this email or contact our support team if you have concerns.</p>

                <p>Best regards,<br>The ${PLATFORM_NAME} Team</p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
                <p><a href="https://jobbinex.com" style="color: #555555;">Visit Website</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

export default Reset;
