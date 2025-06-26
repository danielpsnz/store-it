/* eslint-disable no-unused-vars */

// Defines supported file types in the system
declare type FileType = "document" | "image" | "video" | "audio" | "other";

// Defines the structure of an action, typically used in UI components (e.g., dropdowns or buttons)
declare interface ActionType {
  label: string; // Display name for the action
  icon: string; // Icon name or path associated with the action
  value: string; // Unique value identifier for internal use
}

// Defines the props structure for a component or function that uses route parameters or search parameters
declare interface SearchParamProps {
  params?: Promise<SegmentParams>; // Asynchronous route parameters (e.g., from a dynamic segment)
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; // Optional query parameters
}

// Props required when uploading a file to the system
declare interface UploadFileProps {
  file: File; // File object to be uploaded
  ownerId: string; // User ID of the file owner
  accountId: string; // Account or workspace identifier
  path: string; // Destination path or directory for the uploaded file
}

// Props for fetching files with optional filters
declare interface GetFilesProps {
  types: FileType[]; // Array of file types to filter the results
  searchText?: string; // Optional search term to filter files by name or content
  sort?: string; // Optional sort order or criteria (e.g., "name", "date")
  limit?: number; // Optional limit on number of files returned
}

// Props required to rename a file
declare interface RenameFileProps {
  fileId: string; // Unique identifier of the file to rename
  name: string; // New file name (without extension)
  extension: string; // File extension to preserve or modify
  path: string; // File path or location
}

// Props to update users with access to a specific file
declare interface UpdateFileUsersProps {
  fileId: string; // File identifier to share access with users
  emails: string[]; // List of user email addresses to grant access
  path: string; // File path for context
}

// Props required to delete a file
declare interface DeleteFileProps {
  fileId: string; // Internal file ID used in the app
  bucketFileId: string; // ID of the file in the storage bucket (e.g., S3, Firebase)
  path: string; // File path or location to assist in deletion
}

// Props for a reusable file uploader component
declare interface FileUploaderProps {
  ownerId: string; // ID of the user uploading the file
  accountId: string; // ID of the user's account or organization
  className?: string; // Optional class name for custom styling
}

// Props for rendering mobile navigation UI with user information
declare interface MobileNavigationProps {
  ownerId: string; // Unique user ID
  accountId: string; // Associated account ID
  fullName: string; // Full name of the user (for display)
  avatar: string; // Avatar URL or image source
  email: string; // User's email address
}

// Props for a sidebar UI component displaying user info
declare interface SidebarProps {
  fullName: string; // Full name of the user
  avatar: string; // Avatar image URL
  email: string; // User's email address
}

// Props for displaying a file thumbnail based on its type and extension
declare interface ThumbnailProps {
  type: string; // File type (e.g., "image", "video")
  extension: string; // File extension (e.g., ".jpg", ".pdf")
  url: string; // URL to fetch the thumbnail or file preview
  className?: string; // Optional class for the container styling
  imageClassName?: string; // Optional class for the image styling
}

// Props for sharing a file with users by email and managing the input state
declare interface ShareInputProps {
  file: Models.Document; // File document to be shared
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Callback to handle input field changes
  onRemove: (email: string) => void; // Callback to remove an email from the share list
}

// Props definition for the FileUploader component
export interface FileUploaderProps {
  ownerId: string; // ID of the user or owner of the file
  accountId: string; // Account ID used to associate the upload
  className?: string; // Optional class name for styling override
}

export interface ThumbnailProps {
  // File type, e.g. "image", "video", "document"
  type: string;
  // File extension, e.g. "jpg", "png", "pdf"
  extension: string;
  // Optional URL of the image or file thumbnail
  url?: string;
  // Optional additional CSS classes for the <Image> element
  imageClassName?: string;
  // Optional additional CSS classes for the wrapper <figure> element
  className?: string;
}