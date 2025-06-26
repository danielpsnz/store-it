"use server"; // Directive indicating this code runs on the server (Next.js app directory convention)

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

/**
 * Generic error handler for consistent error logging and throwing.
 * @param error - The error object caught.
 * @param message - Custom error message for context.
 */
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

/**
 * Uploads a file to Appwrite storage and creates a corresponding metadata document in the database.
 * @param file - The file object (Buffer) to upload.
 * @param ownerId - ID of the user who owns the file.
 * @param accountId - Associated account ID.
 * @param path - Path to revalidate for Next.js ISR (Incremental Static Regeneration).
 * @returns The newly created file document, serialized.
 */
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    // Wrap raw file buffer into InputFile for Appwrite API compatibility
    const inputFile = InputFile.fromBuffer(file, file.name);

    // Upload the file to Appwrite storage
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    // Construct file metadata document for database
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    // Save file metadata to database
    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        // Rollback file upload if document creation fails
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    // Trigger revalidation of the path (for dynamic content update)
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

/**
 * Constructs dynamic query filters for retrieving files from the database.
 * @param currentUser - Authenticated user document.
 * @param types - List of file types to filter by.
 * @param searchText - Text to search within file names.
 * @param sort - Sorting format, e.g., "name-asc" or "$createdAt-desc".
 * @param limit - Optional result limit.
 * @returns An array of Appwrite Query objects.
 */
const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    // Show files owned by the user or shared with their email
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  // Add sorting clause
  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }

  return queries;
};

/**
 * Retrieves a list of files visible to the current user, with filtering, search, and sorting.
 * @param types - Optional filter for file types (e.g. ['pdf', 'image']).
 * @param searchText - Optional search term to filter by file name.
 * @param sort - Sort key and order, e.g., "$createdAt-desc".
 * @param limit - Optional maximum number of results.
 * @returns A list of file documents, serialized.
 */
export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    // Build the query parameters
    const queries = createQueries(currentUser, types, searchText, sort, limit);

    // Fetch matching file documents
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

/**
 * Renames a file by updating its document name in the database.
 * @param fileId - ID of the file document in the database.
 * @param name - New base name of the file (without extension).
 * @param extension - File extension to append.
 * @param path - Path to revalidate after renaming.
 * @returns The updated file document, serialized.
 */
export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName }
    );

    // Revalidate UI or cached content for the given path
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

/**
 * Updates the list of users that a file is shared with.
 * @param fileId - ID of the file document in the database.
 * @param emails - Array of user email addresses to grant access.
 * @param path - Path to revalidate after sharing changes.
 * @returns The updated file document, serialized.
 */
export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

/**
 * Deletes a file from both the database and Appwrite storage bucket.
 * @param fileId - ID of the file document in the database.
 * @param bucketFileId - ID of the file in Appwrite storage bucket.
 * @param path - Path to revalidate after deletion.
 * @returns A success status object, serialized.
 */
export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    // If the document was successfully deleted, also remove the storage file
    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

/**
 * Calculates the total storage space used by the current authenticated user.
 * Aggregates usage by file type and tracks the latest update timestamp for each.
 * @returns A summary object containing used space, breakdown by type, and quota.
 */
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User is not authenticated.");

    // Get all files owned by the current user
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])]
    );

    // Initialize space usage tracker
    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB quota
    };

    // Aggregate file sizes by type
    files.documents.forEach((file) => {
      const fileType = file.type as FileType;

      // Add size to respective type and overall usage
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      // Track most recent update date per type
      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used");
  }
}
