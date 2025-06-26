"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants"; // List of navigation items: [{ url, name, icon }]
import { usePathname } from "next/navigation"; // Hook to get current route path
import { cn } from "@/lib/utils"; // Utility for conditional classNames

// Define prop types for the Sidebar component
interface Props {
  fullName: string; // Full name of the user to display
  avatar: string; // URL path to the user's avatar image
  email: string; // User's email address
}

// Sidebar component displaying navigation links, branding, and user info
const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname(); // Get the current pathname to highlight the active link

  return (
    <aside className="sidebar">
      {/* Brand logo (responsive display) */}
      <Link href="/">
        {/* Full logo visible on large screens */}
        <Image
          src="/assets/icons/logo-full-brand.svg"
          alt="logo"
          width={160}
          height={50}
          className="hidden h-auto lg:block"
        />

        {/* Compact logo for smaller screens */}
        <Image
          src="/assets/icons/logo-brand.svg"
          alt="logo"
          width={52}
          height={52}
          className="lg:hidden"
        />
      </Link>

      {/* Navigation menu */}
      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {/* Map through navItems to generate links */}
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item", // Base class for nav item
                  pathname === url && "shad-active" // Highlight active link
                )}
              >
                {/* Icon for the navigation item */}
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon", // Base icon style
                    pathname === url && "nav-icon-active" // Highlight active icon
                  )}
                />
                {/* Show nav item name on larger screens */}
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* Decorative or promotional image (can be replaced with dynamic content) */}
      <Image
        src="/assets/images/files-2.png"
        alt="sidebar graphic"
        width={506}
        height={418}
        className="w-full"
      />

      {/* Display user info (avatar, name, email) */}
      <div className="sidebar-user-info">
        {/* User avatar */}
        <Image
          src={avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        {/* Display full name and email on large screens */}
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
