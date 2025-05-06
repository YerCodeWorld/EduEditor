"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();
  const isEditPage = pathname === "/";

  // Make this thing differently, and please center that button, thanks.
  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-0.5">
        <Link
          href={isEditPage ? "/post-csr" : "/"}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isEditPage ? "Preview" : "Edit"}
        </Link>
      </div>
    </header>
  );
};

export default Header;
