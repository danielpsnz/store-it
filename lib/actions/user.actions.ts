"use server";

// Import necessary utilities and configurations
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

/**
 * Fetches a user document from the database by email.
 * This is used to check if a user already exists before account creation.
 *
 * @param email - The user's email address.
 * @returns The user document if found, otherwise null.
 */
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

/**
 * Logs and rethrows an error with a custom message.
 *
 * @param error - The caught error object.
 * @param message - A human-readable error message for debugging.
 */
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

/**
 * Sends a one-time password (OTP) to the user's email address.
 * This uses Appwrite's `createEmailToken` method to generate the OTP.
 *
 * @param email - The email address to send the OTP to.
 * @returns The Appwrite-generated user ID.
 */
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

/**
 * Creates a user account by sending an OTP and, if necessary, creating a new user document.
 *
 * @param fullName - The full name of the user.
 * @param email - The email address of the user.
 * @returns The account ID needed to complete the session verification.
 */
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  // Check for existing user
  const existingUser = await getUserByEmail(email);

  // Send OTP to the user’s email
  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  // If user does not exist, create a new user document in the database
  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};

/**
 * Verifies the OTP using the provided account ID and password (secret).
 * If successful, it creates a session and stores the session token as a cookie.
 *
 * @param accountId - The Appwrite-generated user ID.
 * @param password - The OTP received via email.
 * @returns The session ID for the created session.
 */
export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    // Set secure HTTP-only cookie for the session
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

/**
 * Retrieves the currently logged-in user based on the session cookie.
 * It uses the account ID to fetch the corresponding user document from the database.
 *
 * @returns The user document, or null if not found.
 */
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    // Get session info from Appwrite account
    const result = await account.get();

    // Retrieve user document from the database
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)]
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Logs out the current user by deleting the session both in Appwrite and in cookies.
 * Redirects to the sign-in page after logout.
 */
export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

/**
 * Initiates sign-in by checking for an existing user and sending an OTP if found.
 *
 * @param email - The email address used to sign in.
 * @returns The account ID if user exists; otherwise, a message indicating the user was not found.
 */
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};
