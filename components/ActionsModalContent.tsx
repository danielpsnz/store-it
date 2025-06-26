import { Models } from "node-appwrite"; // Import type definitions for Appwrite models
import Thumbnail from "@/components/Thumbnail"; // Component to display file thumbnails
import FormattedDateTime from "@/components/FormattedDateTime"; // Component to display formatted date/time
import { convertFileSize, formatDateTime } from "@/lib/utils"; // Utility functions for file size and date/time formatting
import React from "react";
import { Input } from "@/components/ui/input"; // Custom styled input component
import { Button } from "@/components/ui/button"; // Custom styled button component
import Image from "next/image"; // Next.js optimized image component

/**
 * ImageThumbnail component
 * Displays a thumbnail preview of the file along with its name and creation date.
 * @param file - The file document containing metadata such as type, extension, URL, name, and creation date.
 */
const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    {/* Render the file thumbnail based on file type, extension, and URL */}
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />

    {/* Display file name and creation date/time */}
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

/**
 * DetailRow component
 * Simple layout for displaying a label and corresponding value in a horizontal flex container.
 * @param label - The descriptor text for the row.
 * @param value - The value text associated with the label.
 */
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

/**
 * FileDetails component
 * Displays detailed information about a file including its thumbnail,
 * format, size, owner, and last modification date.
 * @param file - The file document object with metadata.
 */
export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      {/* Show file thumbnail with basic info */}
      <ImageThumbnail file={file} />

      {/* Display file details using multiple DetailRow components */}
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>; // Callback to handle email input changes as an array of emails
  onRemove: (email: string) => void; // Callback to remove a shared user by email
}

/**
 * ShareInput component
 * UI for sharing a file with other users by entering their email addresses.
 * Displays current shared users with the option to remove them.
 * @param file - The file document including a list of users shared with.
 * @param onInputChange - Handler triggered when the email input changes.
 * @param onRemove - Handler to remove a user from the shared list.
 */
export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
      {/* Show the thumbnail and basic info for the file being shared */}
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        {/* Instructional label */}
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>

        {/* Input for entering email addresses, comma-separated */}
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />

        {/* Section displaying the list of users the file is shared with */}
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          {/* List of shared users with remove button */}
          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                  aria-label={`Remove ${email} from shared users`}
                >
                  {/* Remove icon */}
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="Remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
