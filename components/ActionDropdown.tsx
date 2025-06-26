"use client";

// Import UI components for dialog and dropdown menus
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";

// Define the ActionDropdown component that handles file-related actions (rename, share, delete)
// Receives a file object of type Models.Document as a prop
const ActionDropdown = ({ file }: { file: Models.Document }) => {
  // State to control whether the modal dialog is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to control whether the dropdown menu is open
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State to track the current selected action (e.g., rename, share, delete)
  const [action, setAction] = useState<ActionType | null>(null);

  // State to keep track of the file name input for renaming
  const [name, setName] = useState(file.name);

  // State to indicate if an action is currently processing (loading spinner, disabling buttons, etc.)
  const [isLoading, setIsLoading] = useState(false);

  // State to hold the list of emails used for sharing the file
  const [emails, setEmails] = useState<string[]>([]);

  // Get current route path (useful for API calls that depend on context)
  const path = usePathname();

  // Utility function to reset and close all modals, dropdowns and states
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    // If needed, reset emails here too: setEmails([]);
  };

  // Main handler to perform the selected action (rename, share, or delete)
  const handleAction = async () => {
    // Exit early if no action is selected
    if (!action) return;

    // Set loading state to disable UI while processing
    setIsLoading(true);

    let success = false;

    // Map action types to their respective async handler functions
    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
    };

    // Execute the selected action and wait for success status
    success = await actions[action.value as keyof typeof actions]();

    // If action succeeded, close all modals and reset state
    if (success) closeAllModals();

    // Reset loading state after operation completes
    setIsLoading(false);
  };

  // Handler to remove a user (email) from the shared file users list
  const handleRemoveUser = async (email: string) => {
    // Filter out the email to be removed
    const updatedEmails = emails.filter((e) => e !== email);

    // Update the backend with the new users list
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    // If update successful, update local state and close modals
    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  // Function to render the content of the modal dialog based on the selected action
  const renderDialogContent = () => {
    // If no action is selected, do not render anything
    if (!action) return null;

    // Destructure the action object to get the value (action key) and label (display text)
    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        {/* Dialog header containing the title and conditional input or components */}
        <DialogHeader className="flex flex-col gap-3">
          {/* Display the action label as the dialog title, centered and styled */}
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>

          {/* Conditional rendering based on the current action: */}

          {/* If the action is 'rename', show an input field for editing the file name */}
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)} // Update state on input change
            />
          )}

          {/* If the action is 'details', render the FileDetails component to show file info */}
          {value === "details" && <FileDetails file={file} />}

          {/* If the action is 'share', render the ShareInput component for managing shared users */}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails} // Update email list on input change
              onRemove={handleRemoveUser} // Remove user callback
            />
          )}

          {/* If the action is 'delete', show a confirmation message with the file name */}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>

        {/* Render the dialog footer (buttons) only for rename, delete, and share actions */}
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            {/* Cancel button to close the modal without performing any action */}
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>

            {/* Submit button to trigger the selected action */}
            <Button onClick={handleAction} className="modal-submit-button">
              {/* Show action label with first letter capitalized */}
              <p className="capitalize">{value}</p>

              {/* If an action is loading, display a spinning loader icon */}
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    // Main Dialog component controlling the modal visibility based on isModalOpen state
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      {/* DropdownMenu component controlling the dropdown toggle and visibility */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        {/* Trigger button for the dropdown menu - displays three dots icon */}
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>

        {/* Dropdown menu content listing all possible actions */}
        <DropdownMenuContent>
          {/* Label showing the current file name with truncation for long names */}
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>

          {/* Separator line between label and action items */}
          <DropdownMenuSeparator />

          {/* Map over predefined action items to create each dropdown option */}
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                // Set the selected action in state when user clicks on an item
                setAction(actionItem);

                // For certain actions, open the modal dialog to perform the action
                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {/* 
              If the action is 'download', render a Link to directly download the file 
              This includes an icon and label inside the link for better UX and semantics 
            */}
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                /* For other actions, display icon and label inside a div (non-link) */
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render the modal dialog content based on the selected action */}
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
