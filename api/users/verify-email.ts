import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI || '');
    await cachedClient.connect();
  }
  return cachedClient.db('aura-music');
}

function getVerificationPage(success: boolean, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA - Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #050714;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .icon.success { background: rgba(45,212,191,0.15); border: 1px solid rgba(45,212,191,0.3); }
    .icon.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); }
    h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .brand {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 20px;
    }
    a.btn {
      display: inline-block;
      padding: 12px 36px;
      background: linear-gradient(135deg, #1e3a5f, #2dd4bf);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 28px;
      transition: transform 0.2s;
    }
    a.btn:hover { transform: scale(1.03); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon \${success ? 'success' : 'error'}">\${success ? '✅' : '❌'}</div>
    <h1>\${success ? 'Verified!' : 'Error'}</h1>
    <p>\${message}</p>
    <a href="/" class="btn">Open AURA</a>
    <div class="brand">AURA Music © \${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send(getVerificationPage(false, 'Method not allowed.'));
  }

  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).send(getVerificationPage(false, 'No verification token provided.'));
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).send(getVerificationPage(false, 'Invalid or expired verification link.'));
    }

    if (user.emailVerified) {
      return res.status(200).send(getVerificationPage(true, 'Your email is already verified! You can close this tab and sign in.'));
    }

    // Mark email as verified
    await db.collection('users').updateOne(
      { verificationToken: token },
      { $set: { emailVerified: true }, $unset: { verificationToken: '' } }
    );

    return res.status(200).send(getVerificationPage(true, 'Email verified successfully! You can now sign in to AURA.'));
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).send(getVerificationPage(false, 'Something went wrong. Please try again.'));
  }
}
