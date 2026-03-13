// appwrite-node.js - Node.js compatible Appwrite configuration for seeding scripts
import { Client, Account, Databases, Storage, ID, Permission, Role, Query, Realtime } from 'appwrite';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const appwriteConfig = {
  endpoint: process.env.VITE_APPWRITE_ENDPOINT,
  projectId: process.env.VITE_APPWRITE_PROJECT_ID,
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);
export const IDs = ID;

export const APPWRITE_DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_BUCKET_ID = process.env.VITE_APPWRITE_BUCKET_ID;

// APPWRITE_DATABASE_ID Tables IDs
export const COLLECTION_ALERTS_ID = process.env.VITE_COLLECTION_ALERTS_ID;
export const COLLECTION_CRISES_ID = process.env.VITE_COLLECTION_CRISES_ID;
export const COLLECTION_STATISTICS_ID = process.env.VITE_COLLECTION_STATISTICS_ID;
export const COLLECTION_RISK_ZONES_ID = process.env.VITE_COLLECTION_RISK_ZONES_ID;
export const COLLECTION_INCIDENTS_ID = process.env.VITE_COLLECTION_INCIDENTS_ID;
export const COLLECTION_REGIONS_ID = process.env.VITE_COLLECTION_REGIONS_ID;

export default client;

export { Permission, Role, Query };