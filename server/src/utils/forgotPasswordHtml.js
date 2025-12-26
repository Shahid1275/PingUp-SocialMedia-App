const htmlContent = (otp) => {
  const html = `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
                  text-align: center;
              }
              .container {
                  max-width: 400px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              .otp {
                  font-size: 24px;
                  font-weight: bold;
                  color: #007bff;
                  margin: 20px 0;
              }
              .footer {
                  font-size: 14px;
                  color: #777;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Forgot Password</h2>
              <p>Your One-Time Password (OTP) is:</p>
              <p class="otp">${otp}</p>
              <p>This OTP is valid for only 2 minutes. Do not share it with anyone.</p>
              <p class="footer">If you didn't request this, please ignore this email.</p>
          </div>
      </body>
      </html>
      `;
  return html;
};

module.exports = htmlContent;
