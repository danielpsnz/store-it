import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
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

/**
 * Thumbnail component displays a file preview.
 * - If the file is an image (excluding SVG), it renders the image from the URL.
 * - Otherwise, it renders a generic icon based on file type and extension.
 *
 * @param {Props} props - Component properties
 * @returns JSX Element rendering the thumbnail image or icon
 */
export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  // Determine if the file should be displayed as an image
  const isImage = type === "image" && extension !== "svg";

  return (
    // Wrapper figure element with base and optional custom classes
    <figure className={cn("thumbnail", className)}>
      <Image
        // Use file URL if an image, otherwise fallback to generic file icon
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        // Compose class names for the image element, including conditional styling for images
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};

export default Thumbnail;
