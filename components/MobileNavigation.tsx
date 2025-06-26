"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";

// Props interface defining the required user information
interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

/**
 * MobileNavigation is a responsive mobile header component
 * that includes:
 * - User avatar and info display
 * - A collapsible side sheet menu
 * - Navigation links
 * - File upload option
 * - Logout button
 */
const MobileNavigation = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  // State to manage whether the side sheet menu is open
  const [open, setOpen] = useState(false);

  // Retrieve the current path to highlight active navigation links
  const pathname = usePathname();

  return (
    <header className="mobile-header">
      {/* Logo displayed at the top of the mobile navigation */}
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
      />

      {/* Sheet component acts as a sliding drawer menu for mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Menu trigger button (hamburger icon) */}
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="Menu"
            width={30}
            height={30}
          />
        </SheetTrigger>

        {/* Content inside the mobile drawer */}
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            {/* Display user avatar and information */}
            <div className="header-user">
              <Image
                src={avatar}
                alt="User avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            {/* Divider below user info */}
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>

          {/* Mobile navigation links */}
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active"
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active"
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          {/* Divider between navigation and actions */}
          <Separator className="my-5 bg-light-200/20" />

          {/* Additional user actions: file upload and logout */}
          <div className="flex flex-col justify-between gap-5 pb-5">
            {/* File uploader component, allowing user to upload files */}
            <FileUploader ownerId={ownerId} accountId={accountId} />

            {/* Logout button that triggers signOutUser action */}
            <Button
              type="submit"
              className="mobile-sign-out-button"
              onClick={async () => await signOutUser()}
            >
              <Image
                src="/assets/icons/logout.svg"
                alt="Logout icon"
                width={24}
                height={24}
              />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
