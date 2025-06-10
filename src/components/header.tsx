"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Sunday Services", href: "#sunday-services" },
    { name: "Weekly Services", href: "#weekly-services" },
    { name: "Community", href: "#community" },
    { name: "Latest Services", href: "#latest-services" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-orange-700 w-full text-white py-2 px-4 z-50">
      {/* <img /> */}
      <nav className="max-w-4xl mx-auto">
        <div className="relative flex h-12 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                href="/"
                className="text-2xl font-bold font-montserrat tracking-wide text-white"
              >
                BMC NY
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-orange-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu dialog */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="relative z-50"
      >
        {/* Blurred backdrop */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        {/* Sliding panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <DialogPanel
                transition
                className="pointer-events-auto relative w-screen max-w-sm transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
              >
                <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-6 bg-orange-700">
                    <Link
                      href="/"
                      className="text-2xl font-bold font-montserrat tracking-wide text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      BMC NY
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="relative rounded-md p-2 text-white hover:bg-orange-600"
                    >
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 px-4 py-6">
                    <nav className="flex flex-col space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-4 py-3 text-lg font-medium text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Footer info */}
                  <div className="border-t border-orange-100 px-4 py-6">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-orange-700">
                        Service Times
                      </p>
                      <p>Sunday: 6PM (EST) - On-site</p>
                      <p>Sunday: 10AM (EST) - Online</p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
