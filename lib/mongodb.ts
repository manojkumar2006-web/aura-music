/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in .env');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('aura-music');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
