/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';

export async function sendVerificationEmail(toEmail: string, token: string, displayName: string): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyLink = `${appUrl}/api/users/verify-email?token=${token}`;

  const mailOptions = {
    from: `"AURA Music" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🎵 Verify your AURA Music account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #0a0e27 0%, #121638 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
        <!-- Header -->
        <div style="padding: 40px 32px 24px; text-align: center;">
          <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #1e3a5f, #2dd4bf); line-height: 56px; font-size: 24px; margin-bottom: 16px;">
            🎵
          </div>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: 6px; text-transform: uppercase;">
            AURA
          </h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
            Music Streaming Platform
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 0 32px 32px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 8px;">
            Welcome, ${displayName}! 👋
          </h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
            You're almost there. Click the button below to verify your email address and start your AURA experience.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${verifyLink}" 
               style="display: inline-block; padding: 14px 48px; background: linear-gradient(135deg, #1e3a5f, #2dd4bf); color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 50px; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 8px 25px rgba(45,212,191,0.3);">
              VERIFY EMAIL
            </a>
          </div>

          <!-- Fallback Link -->
          <p style="color: rgba(255,255,255,0.35); font-size: 11px; line-height: 1.5; margin: 0 0 4px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #2dd4bf; font-size: 11px; word-break: break-all; margin: 0 0 28px; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            ${verifyLink}
          </p>

          <!-- Footer Divider -->
          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
            <p style="color: rgba(255,255,255,0.25); font-size: 10px; text-align: center; margin: 0; letter-spacing: 1px; text-transform: uppercase;">
              This link expires in 24 hours · AURA © ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
}
