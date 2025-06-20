"use server"; // Directive for Next.js to indicate that this file should run on the server

// Import Appwrite SDK modules for managing account, avatars, client connection, databases, and storage
import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";

// Import custom Appwrite configuration object (includes endpoint URL, project ID, and secret key)
import { appwriteConfig } from "@/lib/appwrite/config";

// Import cookies utility from Next.js to access server-side cookies
import { cookies } from "next/headers";

/**
 * Creates an Appwrite client for authenticated sessions.
 * This function is typically used for user-level operations that require an active session.
 * It retrieves the session token from HTTP-only cookies and sets it on the Appwrite client.
 *
 * @returns An object providing scoped access to the `Account` and `Databases` services with the authenticated session.
 * @throws Will throw an error if no session cookie is found.
 */
export const createSessionClient = async () => {
  // Initialize Appwrite client and set its endpoint and project ID from config
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  // Attempt to retrieve the session token from cookies
  const session = (await cookies()).get("appwrite-session");

  // Throw an error if session is missing or invalid
  if (!session || !session.value) throw new Error("No session");

  // Set the session token on the Appwrite client to authenticate future requests
  client.setSession(session.value);

  // Return accessors for authenticated services
  return {
    get account() {
      return new Account(client); // Provides access to account-related API calls (e.g., get user info, update account)
    },
    get databases() {
      return new Databases(client); // Provides access to database operations (e.g., create/read/update/delete documents)
    },
  };
};

/**
 * Creates an Appwrite client with admin-level access using an API key.
 * This function is used for privileged operations such as managing resources across users or projects.
 *
 * @returns An object providing access to `Account`, `Databases`, `Storage`, and `Avatars` services with elevated permissions.
 */
export const createAdminClient = async () => {
  // Initialize Appwrite client with endpoint, project ID, and secret API key
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey); // Use admin API key for elevated access

  // Return accessors for admin-level services
  return {
    get account() {
      return new Account(client); // Manage any account (not just the logged-in user's)
    },
    get databases() {
      return new Databases(client); // Full access to database operations across collections
    },
    get storage() {
      return new Storage(client); // Allows file upload/download and management
    },
    get avatars() {
      return new Avatars(client); // Generate default avatars or icons (useful for user profiles)
    },
  };
};