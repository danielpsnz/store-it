import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";

// Component imports
import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";

// Utility functions and API actions
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";

// Main dashboard page component (server component)
const Dashboard = async () => {
  // Fetch recent files and total storage used in parallel to improve performance
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }), // Fetch latest 10 files (no type filter)
    getTotalSpaceUsed(), // Fetch total used storage space
  ]);

  // Generate file type usage summaries (e.g., images, videos, etc.)
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      {/* Summary section: chart and file type cards */}
      <section>
        {/* Usage chart: displays total storage used */}
        <Chart used={totalSpace.used} />

        {/* Summary cards: display top file types, sizes, and last upload dates */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  {/* File type icon */}
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />

                  {/* Human-readable size of files in this category */}
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                {/* File type title (e.g., "Images", "Documents") */}
                <h5 className="summary-type-title">{summary.title}</h5>

                {/* Visual separator */}
                <Separator className="bg-light-400" />

                {/* Last upload date for this file type */}
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent uploads section */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>

        {files.documents.length > 0 ? (
          // List of recently uploaded files
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file: Models.Document) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}
              >
                {/* Thumbnail based on file type and extension */}
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                {/* File details (name, upload date, and actions) */}
                <div className="recent-file-details">
                  <div className="flex flex-col gap-1">
                    <p className="recent-file-name">{file.name}</p>
                    <FormattedDateTime
                      date={file.$createdAt}
                      className="caption"
                    />
                  </div>

                  {/* Actions dropdown (e.g., delete, download) */}
                  <ActionDropdown file={file} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          // Fallback if no files are available
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
