// Import React and utility functions
import React from "react";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * Component: FormattedDateTime
 *
 * Description:
 * A reusable React component that takes an ISO 8601 date string as input
 * and renders a formatted version of the date/time inside a styled <p> tag.
 * It supports optional custom class names for styling flexibility.
 *
 * Props:
 * - date (string): The ISO date string to be formatted and displayed.
 * - className (string, optional): Additional CSS classes to apply to the paragraph element.
 *
 * Usage:
 * <FormattedDateTime date="2025-06-21T14:30:00Z" className="text-primary" />
 */
export const FormattedDateTime = ({
  date,
  className,
}: {
  date: string;
  className?: string;
}) => {
  return (
    // Render the formatted date with optional className styling
    <p className={cn("body-1 text-light-200", className)}>
      {formatDateTime(date)}
    </p>
  );
};

// Export the component as the default export
export default FormattedDateTime;
