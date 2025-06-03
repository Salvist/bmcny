"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-sm w-full text-amber-400 p-4 z-50">
      {/* <img /> */}
      <nav className="max-w-4xl mx-auto flex items-center">
        {/* <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="mr-4 inline-flex items-center justify-center rounded-md text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6 text-white" />
          </button>
        </div> */}
        <ul>
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide"
          >
            BMC NY
          </Link>
        </ul>
      </nav>
    </header>
  );
}
