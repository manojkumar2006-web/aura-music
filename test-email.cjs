require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Nodemailer with Gmail...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"AURA Music Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to themselves
      subject: "AURA Test Verification",
      text: "If you see this, Nodemailer is working perfectly!",
      html: "<b>If you see this, Nodemailer is working perfectly!</b>",
    });
    console.log("Message sent: %s", info.messageId);
    process.exit(0);
  } catch (error) {
    console.error("Error sending email:", error);
    process.exit(1);
  }
}

testEmail();
