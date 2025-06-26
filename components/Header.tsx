import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

// Header component receives userId and accountId as props
const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      {/* Search bar component */}
      <Search />

      {/* Wrapper for right-aligned header content */}
      <div className="header-wrapper">
        {/* File uploader, configured with user-specific data */}
        <FileUploader ownerId={userId} accountId={accountId} />

        {/* Sign-out button using a form with server-side action */}
        <form
          action={async () => {
            "use server"; // Directive for server actions in Next.js
            await signOutUser(); // Calls the sign-out function
          }}
        >
          <Button
            type="submit"
            className="sign-out-button"
            aria-label="Sign out"
          >
            {/* Logout icon */}
            <Image
              src="/assets/icons/logout.svg"
              alt="Logout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
