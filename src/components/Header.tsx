

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();

  const navItem =
    "px-4 py-1.5 rounded-full transition-all duration-200 text-amber-800";

  const activeNav =
    "bg-black text-white px-4 py-1.5 rounded-full";

  return (
    <header className="w-full font-sans">
      {/* Top Banner */}
      <div className="bg-[var(--primary)] text-white text-xs py-1.5 text-center px-4">
        36% OFF all custom storage | Free delivery on everything, sofas included |
        <span className="font-bold underline italic text-red-100 ml-1">
          Ends 17.02.00
        </span>
      </div>

      {/* Main Navbar */}
      <div className="bg-[var(--secondary)] px-4 md:px-10 py-4 flex items-center justify-between">

        {/* Search Bar */}
        <div className="flex-1 max-w-xs relative hidden md:block">
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
        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden">
            <Image
              src="/image/logo.png"
              alt="Ratlami Interio Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#5d3a1a] tracking-tight">
            RATLAMIINTERIO
          </h1>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4 flex-1 justify-end text-sm font-medium">

          

          {/* Vendors */}
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

          {/* Home  */}
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

          {/* Contact */}
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
    </header>
  );
};

export default Header;