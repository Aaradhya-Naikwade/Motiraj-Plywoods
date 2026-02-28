
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItem =
    "px-4 py-1.5 rounded-full transition-all duration-200 text-amber-800";

  const activeNav =
    "bg-black text-white px-4 py-1.5 rounded-full";

  return (
    <header className="w-full font-sans relative z-50">
      {/* Top Banner */}
      <div className="bg-[var(--primary)] text-white text-xs py-1.5 text-center px-4">
        36% OFF all custom storage | Free delivery on everything |
        <span className="font-bold underline italic text-red-100 ml-1">
          Ends 17.02.00
        </span>
      </div>

      {/* Main Navbar */}
      <div className="bg-[var(--secondary)] px-4 md:px-10 py-4 flex items-center justify-between">

        {/* Left Section (Hamburger - Mobile Only) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-amber-800 focus:outline-none"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Search (Desktop) */}
        <div className="hidden md:block flex-1 max-w-xs relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-400 rounded-full py-1.5 px-10 bg-transparent focus:outline-none"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            size={18}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 justify-center flex-1 md:flex-none">
          <div className="relative w-9 h-9 md:w-12 md:h-12 overflow-hidden">
            <Image
              src="/image/logo.png"
              alt="Ratlami Interio Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-lg md:text-3xl font-serif font-semibold text-[#5d3a1a] tracking-tight">
            RATLAMIINTERIO
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">

          <Link
            href="/vendor"
            className={
              pathname === "/vendor"
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            Vendors
          </Link>

          <Link
            href="/"
            className={
              pathname === "/"
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            About
          </Link>

          <Link
            href="/contact"
            className={
              pathname === "/contact"
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            Contact
          </Link>

          {/* Profile */}
          <div className="flex flex-col items-center cursor-pointer group ml-2">
            <div className="relative w-6 h-6 md:w-7 md:h-7 overflow-hidden">
              <Image
                src="/image/user.png"
                alt="User Profile"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-[10px] text-amber-800 group-hover:text-black mt-0.5">
              Profile
            </span>
          </div>
        </div>
      </div>

      {/* Smooth Animated Mobile Dropdown */}
      <div
        className={`md:hidden bg-[var(--secondary)] overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 py-4 px-4" : "max-h-0 opacity-0"
        }`}
      >
        {/* Mobile Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-400 rounded-full py-2 px-10 bg-transparent focus:outline-none"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            size={18}
          />
        </div>

        <div className="flex flex-col space-y-3 text-amber-800 font-medium">

          <Link href="/vendor" onClick={() => setIsOpen(false)}>
            Vendors
          </Link>

          <Link href="/" onClick={() => setIsOpen(false)}>
            About
          </Link>

          <Link href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          <div className="flex items-center gap-3 pt-3 border-t border-gray-300">
            <div className="relative w-6 h-6 overflow-hidden">
              <Image
                src="/image/user.png"
                alt="User Profile"
                fill
                className="object-cover"
              />
            </div>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;