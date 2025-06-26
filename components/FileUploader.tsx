"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

// Props definition for the FileUploader component
interface Props {
  ownerId: string; // ID of the user or owner of the file
  accountId: string; // Account ID used to associate the upload
  className?: string; // Optional class name for styling override
}

// Main file upload component
const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname(); // Get current path for contextual upload
  const { toast } = useToast(); // Custom toast hook for notifications
  const [files, setFiles] = useState<File[]>([]); // State to track uploaded files

  /**
   * Handles file drop event from the dropzone.
   * - Validates file size
   * - Triggers upload
   * - Shows toast on error
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      // Process each file upload asynchronously
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Reject file if it exceeds max size
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name)
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        // Attempt to upload the file
        return uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            // Remove file from state once uploaded
            if (uploadedFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name)
              );
            }
          }
        );
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path]
  );

  // Hooks provided by react-dropzone
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  /**
   * Removes a file from the current list by name.
   * Used when user clicks the "remove" icon.
   */
  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation(); // Prevents triggering parent click events
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />

      {/* Upload button UI */}
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />{" "}
        <p>Upload</p>
      </Button>

      {/* File preview section displayed while uploading */}
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name); // Extract file type & extension

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail for file based on type */}
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  {/* File name and loader animation */}
                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                {/* Remove file icon */}
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
