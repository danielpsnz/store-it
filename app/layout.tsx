// Import the Metadata type from Next.js for typing the metadata object
import type { Metadata } from "next";

// Import the Poppins font from Google Fonts using Next.js built-in font optimization
import { Poppins } from "next/font/google";

// Import global CSS styles for the entire application
import "./globals.css";

// Configure the Poppins font with specific weights and subsets,
// and assign a CSS custom property variable for easier use in styles
const poppins = Poppins({
  subsets: ["latin"], // Only load latin subset characters to optimize font size
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Include all font weights for flexibility
  variable: "--font-poppins", // CSS variable name to reference the font-family in styles
});

// Define metadata for the application, used by Next.js for SEO and page headers
export const metadata: Metadata = {
  title: "StoreIt", // Title shown in browser tab and search engines
  description: "StoreIt - The only storage solution you need.", // Description meta tag for SEO
};

// RootLayout component wraps the entire app's UI structure and applies global settings
export default function RootLayout({
  children, // React nodes (page content) passed to be rendered inside the layout
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTML root element with language attribute for accessibility and SEO
    <html lang="en">
      {/* 
        Body tag applying:
        - The Poppins font using the CSS variable
        - A font class for fallback and consistency
        - Antialiased text for smoother font rendering 
      */}
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children} {/* Render the nested page content */}
      </body>
    </html>
  );
}
