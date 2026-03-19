"use client";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[#9C825E] text-white">

      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16 
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Contact Us */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">Contact Us</h3>

          {/* Phone */}
          <div className="flex items-start gap-3 mb-4">
            <Phone size={20} className="mt-1 shrink-0" />
            <a
              href="tel:08269211234"
              className="text-sm hover:underline transition-all duration-300"
            >
              08269211234
            </a>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin size={22} className="mt-1 shrink-0" />
            <a
              href="https://www.google.com/maps/place/06,+College+Road,+Shrimalivas,+Shastri+Nagar,+Ratlam,+Madhya+Pradesh+457001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-relaxed hover:underline transition-all duration-300"
            >
              6, College Road, Shrimaliwas, Bohra Bakhla,
              Ratlam, Madhya Pradesh 457001
            </a>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">Quick Links</h3>

          <ul className="space-y-3 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "Vendors", href: "/vendor" },
              { label: "Catalogue", href: "/catalog" },
              // { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:underline hover:text-white/80 transition-all duration-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Products */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">Products</h3>

          <ul className="space-y-3 text-sm">
            {[
              { label: "Decorative Panels", query: "decorative" },
              { label: "Hardware", query: "hardware" },
              { label: "Laminates", query: "laminates" },
              { label: "PVC Doors", query: "pvc door" },
              { label: "Wallpapers", query: "wallpapers" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={`/catalog?query=${encodeURIComponent(item.query)}`}
                  className="hover:underline hover:text-white/80 transition-all duration-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Location Map */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">Location</h3>

          <a
            href="https://www.google.com/maps/place/06,+College+Road,+Shrimalivas,+Shastri+Nagar,+Ratlam,+Madhya+Pradesh+457001"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative w-full h-[140px] sm:h-[160px] rounded overflow-hidden hover:opacity-90 transition duration-300">
              <Image
                src="/image/map.png"
                alt="Map"
                fill
                className="object-cover"
              />
            </div>
          </a>
          <p className="mt-6 font-medium">Follow Us</p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="mailto:support@ratlamiinterio.com"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Email Ratlami Interio"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://www.instagram.com/ratlamiinterio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Ratlami Interio on Instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://wa.me/08269211234"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#853A12]" />

      {/* Copyright */}
      <div className="text-center text-sm sm:text-md px-4 py-4">
        Copyright © 2026 Ratlamiinterio Plywoods All Right Reserved.
        <br className="sm:hidden" />
        Designed By Webdesire
      </div>

      {/* Big Text */}
      <div className="border-t border-[#853A12]">
        <div className="text-center py-8 sm:py-10 px-4">
          <h1
            className="font-bold tracking-wide text-white/90
  text-3xl sm:text-5xl md:text-7xl lg:text-[120px]
  leading-tight break-words text-center"
          >
            RATLAMIINTERIO
          </h1>
        </div>
      </div>

    </footer>
  );
};

export default Footer;





