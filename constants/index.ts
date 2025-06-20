/**
 * Navigation items for the main application sidebar or header menu.
 * Each item includes:
 * - name: Display text for the navigation link
 * - icon: Path to the icon image used for this navigation item
 * - url: The route/path this item links to within the application
 */
export const navItems = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/",
  },
  {
    name: "Documents",
    icon: "/assets/icons/documents.svg",
    url: "/documents",
  },
  {
    name: "Images",
    icon: "/assets/icons/images.svg",
    url: "/images",
  },
  {
    name: "Media",
    icon: "/assets/icons/video.svg",
    url: "/media",
  },
  {
    name: "Others",
    icon: "/assets/icons/others.svg",
    url: "/others",
  },
];

/**
 * Dropdown menu actions for file or item management.
 * Each action includes:
 * - label: Text displayed in the dropdown menu
 * - icon: Path to the icon representing the action visually
 * - value: Unique identifier for the action, used programmatically (e.g., event handlers)
 */
export const actionsDropdownItems = [
  {
    label: "Rename",
    icon: "/assets/icons/edit.svg",
    value: "rename",
  },
  {
    label: "Details",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  {
    label: "Share",
    icon: "/assets/icons/share.svg",
    value: "share",
  },
  {
    label: "Download",
    icon: "/assets/icons/download.svg",
    value: "download",
  },
  {
    label: "Delete",
    icon: "/assets/icons/delete.svg",
    value: "delete",
  },
];

/**
 * Sort options available for file or item listing.
 * Each sort option includes:
 * - label: User-friendly description of the sort criteria and order
 * - value: Internal sort key indicating the attribute and direction (ascending or descending)
 *    Format convention:
 *    - For date attributes: "$createdAt-desc" means sort by createdAt descending (newest first)
 *    - For strings like name: "name-asc" means alphabetical ascending
 *    - For numerical attributes like size: "size-desc" means largest first
 */
export const sortTypes = [
  {
    label: "Date created (newest)",
    value: "$createdAt-desc",
  },
  {
    label: "Created Date (oldest)",
    value: "$createdAt-asc",
  },
  {
    label: "Name (A-Z)",
    value: "name-asc",
  },
  {
    label: "Name (Z-A)",
    value: "name-desc",
  },
  {
    label: "Size (Highest)",
    value: "size-desc",
  },
  {
    label: "Size (Lowest)",
    value: "size-asc",
  },
];

/**
 * URL for a default avatar placeholder image.
 * Used in UI components where a user avatar is expected but none is provided.
 * This is a 3D illustration of a person with sunglasses.
 */
export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

/**
 * Maximum allowed file size for uploads or processing.
 * Defined in bytes.
 * Current limit: 50 megabytes (50 * 1024 * 1024 bytes).
 * This constant should be referenced in file validation logic to prevent oversized uploads.
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
