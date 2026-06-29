/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vercel Serverless catch-all handler.
 * Wraps the entire Express API router so all /api/* routes work on Vercel.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import apiRouter from '../../routes/api';

const app = express();
app.use(express.json());

// Mount the router at "/api" — Vercel preserves the original URL path in req.url
// so /api/users/login is received and Express strips /api → router sees /users/login
app.use('/api', apiRouter);

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
