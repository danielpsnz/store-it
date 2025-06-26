import React from "react";

// Import shared UI components
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

// Import utility to get the currently authenticated user
import { getCurrentUser } from "@/lib/actions/user.actions";

// Import Next.js navigation helper for redirection
import { redirect } from "next/navigation";

// Enable dynamic rendering for this layout, ensuring it runs on every request
export const dynamic = "force-dynamic";

/**
 * Layout component that wraps all authenticated pages.
 * It ensures the user is authenticated, and if not, redirects to the sign-in page.
 * If authenticated, it renders the app's main layout: Sidebar, Header, Mobile Nav, and content.
 *
 * @param children - The page content to render inside the layout
 */
const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Fetch the current authenticated user
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <main className="flex h-screen">
      {/* Sidebar with user information passed as props */}
      <Sidebar {...currentUser} />

      <section className="flex h-full flex-1 flex-col">
        {/* Mobile navigation bar for smaller screens */}
        <MobileNavigation {...currentUser} />

        {/* Header with user-specific identifiers */}
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />

        {/* Render the main content of the page */}
        <div className="main-content">{children}</div>
      </section>

      {/* Toaster for displaying notifications globally */}
      <Toaster />
    </main>
  );
};

export default Layout;
