"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./language_switcher";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");

  const servicesMenu = [
    { name: t("sundayServices"), href: "#sunday-services" },
    { name: t("weeklyServices"), href: "#weekly-services" },
    { name: t("latestServices"), href: "#latest-services" },
  ];

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "#about" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-orange-700 w-full text-white py-2 px-4 z-50"
      role="banner"
    >
      <nav
        className="max-w-4xl mx-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative flex h-12 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-orange-600 hover:text-white focus:outline-none"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">{t("openMainMenu")}</span>
              <Bars3Icon aria-hidden="true" className="block size-6" />
            </button>
          </div>

          {/* Logo - Left */}
          <div className="flex items-center pl-12 sm:pl-0">
            <Link
              href="/"
              className="flex items-center space-x-2 text-2xl font-bold font-montserrat tracking-wide text-white"
              aria-label="Bethany Miracle Center New York - Home"
            >
              <Image
                src="/logo-wide.png"
                alt="BMC NY Logo"
                width={200}
                height={100}
                className="w-16 h-auto"
              />
              <span>BMC NY</span>
            </Link>
          </div>

          {/* Desktop navigation - Center */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 hover:text-white transition-colors"
                role="menuitem"
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
                {t("services")}
                <ChevronDownIcon className="size-4" />
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  {servicesMenu.map((item) => (
                    <MenuItem key={item.name}>
                      <Link
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-orange-100 data-[focus]:text-orange-900"
                      >
                        {item.name}
                      </Link>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>

            <Link
              href="#community"
              className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 hover:text-white transition-colors"
            >
              {t("community")}
            </Link>
          </div>

          {/* Language Switcher - Right */}
          <div className="hidden sm:flex sm:items-center">
            <LanguageSwitcher />
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
                      className="flex items-center space-x-2 text-2xl font-bold font-montserrat tracking-wide text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Image
                        src="/logo-wide.png"
                        alt="BMC NY Logo"
                        width={200}
                        height={100}
                        className="w-16 h-auto"
                      />
                      <span>BMC NY</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="relative rounded-md p-2 text-white hover:bg-orange-600"
                    >
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">{t("closeMenu")}</span>
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

                      {/* Services submenu */}
                      <div className="pl-4">
                        <p className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                          {t("services")}
                        </p>
                        {servicesMenu.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-4 py-2 text-base font-medium text-orange-600 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href="#community"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-lg font-medium text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                      >
                        {t("community")}
                      </Link>

                      {/* Language Switcher in mobile */}
                      <div className="px-4 py-3">
                        <LanguageSwitcher />
                      </div>
                    </nav>
                  </div>

                  {/* Footer info */}
                  <div className="border-t border-orange-100 px-4 py-6">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-orange-700">
                        {t("serviceTimes")}
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
