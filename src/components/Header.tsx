
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

type HeaderProps = {
  isVendorLoggedIn: boolean;
};

const Header = ({ isVendorLoggedIn }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; name: string; category: string; type: string; url: string; source: string }>
  >([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const isVendorsActive = pathname === "/vendor";
  const isHomeActive = pathname === "/";
  const isAboutActive = pathname === "/about";
  const isContactActive = pathname === "/contact";
  const shouldHideHeader =
    pathname.startsWith("/admin") ||
    pathname === "/vendor/auth" ||
    pathname.startsWith("/vendor/auth/") ||
    pathname === "/vendor/signup" ||
    pathname.startsWith("/vendor/signup/");
    
  const navItem =
    "px-4 py-1.5 rounded-full transition-all duration-200 text-amber-800";

  const activeNav =
    "bg-black text-white px-4 py-1.5 rounded-full";

  const hasQuery = searchQuery.trim().length > 0;
  const shouldShowSuggestions = useMemo(
    () =>
      !suppressSuggestions &&
      hasQuery &&
      (suggestions.length > 0 || isSearching || totalResults === 0 || searchMessage.length > 0),
    [hasQuery, suggestions, isSearching, totalResults, searchMessage, suppressSuggestions]
  );

  const groupedSuggestions = useMemo(() => {
    const pdfs = suggestions.filter((item) => item.type === "pdf");
    const vendorImages = suggestions.filter((item) => item.type === "image" && item.source === "vendor");
    const staticImages = suggestions.filter((item) => item.type === "image" && item.source !== "vendor");
    return { pdfs, vendorImages, staticImages };
  }, [suggestions]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setTotalResults(0);
      setSearchMessage("");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/catalog/search?query=${encodeURIComponent(trimmed)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Search failed");
        }
        setSuggestions(Array.isArray(data.results) ? data.results : []);
        setTotalResults(typeof data.total === "number" ? data.total : 0);
        setSearchMessage("");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        setSuggestions([]);
        setTotalResults(0);
        setSearchMessage("Unable to load search results.");
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }
    setSuppressSuggestions(true);
    setSuggestions([]);
    setSearchMessage("");
    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/catalog/search?query=${encodeURIComponent(trimmedQuery)}&limit=1`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const total = typeof data.total === "number" ? data.total : 0;
      if (total === 0) {
        setSearchMessage("No such results found.");
        return;
      }
    } catch {
      setSearchMessage("Unable to search right now.");
      return;
    } finally {
      setIsSearching(false);
    }
    setIsOpen(false);
    router.push(`/catalog?query=${encodeURIComponent(trimmedQuery)}`);
  }

  function handleSuggestionClick(name: string) {
    setSuppressSuggestions(true);
    setSearchQuery(name);
    setSuggestions([]);
    setIsOpen(false);
    router.push(`/catalog?query=${encodeURIComponent(name)}`);
  }

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="w-full font-sans relative z-[200]">
      {/* Top Banner */}
      <div className="overflow-hidden bg-[var(--primary)] py-1.5 text-white">
        <div className="flex w-max whitespace-nowrap text-xs md:text-sm">
          <div className="header-marquee-track flex">
            <span className="px-6">
              36% OFF all custom storage | Free delivery on everything |
              <span className="ml-1 font-bold underline italic text-red-100">
                Ends 17.02.00
              </span>
            </span>
            <span className="px-6">
              36% OFF all custom storage | Free delivery on everything |
              <span className="ml-1 font-bold underline italic text-red-100">
                Ends 17.02.00
              </span>
            </span>
            <span className="px-6">
              36% OFF all custom storage | Free delivery on everything |
              <span className="ml-1 font-bold underline italic text-red-100">
                Ends 17.02.00
              </span>
            </span>
          </div>
        </div>
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
        <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1 max-w-sm relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => {
                setSuppressSuggestions(false);
                setSearchQuery(event.target.value);
              }}
              className="w-full rounded-full border border-[#dbcbb8] bg-white/80 py-2.5 pl-11 pr-12 text-sm text-black shadow-[0_10px_40px_-32px_rgba(68,40,6,0.45)] backdrop-blur focus:border-[#b58a61] focus:outline-none"
              aria-label="Search products and catalogues"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b3e12]"
              size={18}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b3e12]"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>

          {shouldShowSuggestions ? (
            <div className="absolute left-0 right-0 top-full z-[300] mt-3 overflow-hidden rounded-[22px] border border-[#e7dccf] bg-white shadow-[0_28px_70px_-40px_rgba(67,38,6,0.45)]">
              {searchMessage ? (
                <div className="px-4 py-5 text-sm text-red-600">{searchMessage}</div>
              ) : null}

              {!isSearching && totalResults === 0 && !searchMessage ? (
                <div className="px-4 py-5 text-sm text-[#6b5f52]">No results yet. Try a different keyword.</div>
              ) : null}

              <div className="max-h-80 overflow-y-auto py-3">
                {[...groupedSuggestions.pdfs, ...groupedSuggestions.staticImages, ...groupedSuggestions.vendorImages].map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(item.name)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#201710] transition hover:bg-[#f7f2ec]"
                    >
                      {item.type === "image" ? (
                        <span className="relative h-8 w-8 overflow-hidden rounded-xl border border-[#f0e6da] bg-[#f7f2ec]">
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3e8da] text-[#8b3e12]">
                          <Search size={14} />
                        </span>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : null}
        </form>

        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 justify-center flex-1 md:flex-none">
          <div className="relative w-9 h-9 md:w-12 md:h-12 overflow-hidden">
            <Link href="/" aria-label="Go to homepage">
              <Image
                src="/image/logo.png"
                alt="Ratlami Interio Logo"
                fill
                className="object-contain"
              />
            </Link>
          </div>
          <Link href="/" className="text-lg md:text-3xl font-serif font-semibold text-[#5d3a1a] tracking-tight">
            RATLAMIINTERIO
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">


          <Link
            href="/"
            className={
              isHomeActive
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            Home
          </Link>
          
          <Link
            href="/vendor"
            className={
              isVendorsActive
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            Vendors
          </Link>



          {/* <Link
            href="/about"
            className={
              isAboutActive
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            About
          </Link> */}

          <Link
            href="/contact"
            className={
              isContactActive
                ? activeNav
                : `${navItem} hover:bg-black hover:text-white`
            }
          >
            Contact
          </Link>

          {isVendorLoggedIn ? (
            <Link href="/vendor/dashboard" className="flex flex-col items-center cursor-pointer group ml-2">
              <div className="relative w-6 h-6 md:w-7 md:h-7 overflow-hidden">
                <Image
                  src="/image/user.png"
                  alt="Vendor Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] text-amber-800 group-hover:text-black mt-0.5">
                Profile
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Smooth Animated Mobile Dropdown */}
      <div
        className={`md:hidden bg-[var(--secondary)] overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100 py-4 px-4" : "max-h-0 opacity-0"
          }`}
      >
        {/* Mobile Search */}
        <form onSubmit={handleSearchSubmit} className="relative mb-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => {
              setSuppressSuggestions(false);
              setSearchQuery(event.target.value);
            }}
            className="w-full rounded-full border border-[#dbcbb8] bg-white/80 py-2.5 pl-11 pr-12 text-sm text-black shadow-[0_10px_40px_-32px_rgba(68,40,6,0.45)] backdrop-blur focus:border-[#b58a61] focus:outline-none"
            aria-label="Search products and catalogues"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b3e12]"
            size={18}
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b3e12]"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          {searchMessage ? (
            <p className="mt-2 text-xs font-medium text-red-600">{searchMessage}</p>
          ) : null}
          {shouldShowSuggestions ? (
            <div className="absolute left-0 right-0 top-full z-[300] mt-3 overflow-hidden rounded-[22px] border border-[#e7dccf] bg-white shadow-[0_28px_70px_-40px_rgba(67,38,6,0.45)]">
              {searchMessage ? (
                <div className="px-4 py-5 text-sm text-red-600">{searchMessage}</div>
              ) : null}

              {!isSearching && totalResults === 0 && !searchMessage ? (
                <div className="px-4 py-5 text-sm text-[#6b5f52]">No results yet. Try a different keyword.</div>
              ) : null}

              <div className="max-h-72 overflow-y-auto py-3">
                {[...groupedSuggestions.pdfs, ...groupedSuggestions.staticImages, ...groupedSuggestions.vendorImages].map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(item.name)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#201710] transition hover:bg-[#f7f2ec]"
                    >
                      {item.type === "image" ? (
                        <span className="relative h-8 w-8 overflow-hidden rounded-xl border border-[#f0e6da] bg-[#f7f2ec]">
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3e8da] text-[#8b3e12]">
                          <Search size={14} />
                        </span>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : null}
        </form>

        <div className="flex flex-col space-y-3 text-amber-800 font-medium">

          <Link href="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>

          <Link href="/vendor" onClick={() => setIsOpen(false)}>
            Vendors
          </Link>

          {/* <Link href="/about" onClick={() => setIsOpen(false)}>
            About
          </Link> */}

          <Link href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          {isVendorLoggedIn ? (
            <Link
              href="/vendor/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 pt-3 border-t border-gray-300"
            >
              <div className="relative w-6 h-6 overflow-hidden">
                <Image
                  src="/image/user.png"
                  alt="Vendor Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
              <span>Profile</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
