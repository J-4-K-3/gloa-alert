// appwrite.js
import { Client, Account, Databases, Storage, ID, Permission, Role, Query, Realtime } from 'appwrite';

export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);
export const IDs = ID;

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

// APPWRITE_DATABASE_ID Tables IDs
export const COLLECTION_ALERTS_ID = import.meta.env.VITE_COLLECTION_ALERTS_ID;
export const COLLECTION_CRISES_ID = import.meta.env.VITE_COLLECTION_CRISES_ID;
export const COLLECTION_STATISTICS_ID = import.meta.env.VITE_COLLECTION_STATISTICS_ID;
export const COLLECTION_RISK_ZONES_ID = import.meta.env.VITE_COLLECTION_RISK_ZONES_ID;
export const COLLECTION_INCIDENTS_ID = import.meta.env.VITE_COLLECTION_INCIDENTS_ID;
export const COLLECTION_REGIONS_ID = import.meta.env.VITE_COLLECTION_REGIONS_ID;
export const COLLECTION_COMMUNITY_NOTES_ID = import.meta.env.VITE_COLLECTION_COMMUNITY_NOTES_ID;
export const COLLECTION_ANONYMOUS_TIPS_ID = import.meta.env.VITE_COLLECTION_ANONYMOUS_TIPS_ID;
export const COLLECTION_DISCUSSIONS_ID = import.meta.env.VITE_COLLECTION_DISCUSSIONS_ID;
export const COLLECTION_DISCUSSION_REPLIES_ID = import.meta.env.VITE_COLLECTION_DISCUSSION_REPLIES_ID;
export const COLLECTION_VOTINGS_ID = import.meta.env.VITE_COLLECTION_VOTINGS_ID;
export const COLLECTION_TRACKER_ID = import.meta.env.VITE_COLLECTION_TRACKER_ID;

export default client;

export { Permission, Role, Query };
