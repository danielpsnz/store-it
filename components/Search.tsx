"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { useDebounce } from "use-debounce";

// Search bar component with live search capabilities
const Search = () => {
  const [query, setQuery] = useState(""); // Current value of the search input
  const searchParams = useSearchParams(); // Extract URL query parameters
  const searchQuery = searchParams.get("query") || ""; // Get initial query if any
  const [results, setResults] = useState<Models.Document[]>([]); // List of search results
  const [open, setOpen] = useState(false); // Toggle visibility of results dropdown
  const router = useRouter(); // Router for navigation
  const path = usePathname(); // Current path
  const [debouncedQuery] = useDebounce(query, 300); // Delay query updates to reduce fetch frequency

  /**
   * Fetch files when the debounced search query changes.
   * If query is empty, reset results and remove search param from URL.
   */
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }

      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.documents);
      setOpen(true);
    };

    fetchFiles();
  }, [debouncedQuery]);

  /**
   * Sync input state with searchParams if they change externally.
   */
  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  /**
   * Handle click on a file result.
   * Navigates to the appropriate route based on file type.
   */
  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);

    const route =
      file.type === "video" || file.type === "audio"
        ? "media"
        : `${file.type}s`;

    router.push(`/${route}?query=${query}`);
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        {/* Search icon */}
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />

        {/* Search input field */}
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Dropdown with search results */}
        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  className="flex items-center justify-between"
                  key={file.$id}
                  onClick={() => handleClickItem(file)}
                >
                  {/* File preview (icon + name) */}
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  {/* Timestamp of file creation */}
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              // Message shown when no results match the query
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
