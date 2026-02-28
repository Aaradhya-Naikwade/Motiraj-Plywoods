"use client";
import Image from "next/image";
import { Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#9C825E] text-white">

      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 grid md:grid-cols-4 gap-10">

        {/* Contact Us */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>

          {/* Phone */}
          <div className="flex items-start gap-3 mb-4">
            <Phone size={20} className="mt-1" />
            <a
              href="tel:08269211234"
              className="text-sm hover:underline transition-all duration-300"
            >
              08269211234
            </a>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin size={50} className="mt-1" />
            <a
              href="https://www.google.com/maps/place/06,+College+Road,+Shrimalivas,+Shastri+Nagar,+Ratlam,+Madhya+Pradesh+457001/data=!4m2!3m1!1s0x3963fea1721308f5:0x33cd7248127c5e8a?sa=X&ved=1t:242&ictx=111"
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
          <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {["Home", "About us", "Doors", "Catalogue", "Contact us"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:underline hover:text-white/80 transition-all duration-300"
                >
                  • {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Products */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Products</h3>
          <ul className="space-y-3 text-sm">
            {[
              "Teak wood doors",
              "Synthetic doors",
              "Pine Wood Doors",
              "Laminate grooving doors",
              "Laminate profile doors",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:underline hover:text-white/80 transition-all duration-300"
                >
                  • {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Location Map */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Location</h3>

          <a
            href="https://www.google.com/maps/place/06,+College+Road,+Shrimalivas,+Shastri+Nagar,+Ratlam,+Madhya+Pradesh+457001/data=!4m2!3m1!1s0x3963fea1721308f5:0x33cd7248127c5e8a?sa=X&ved=1t:242&ictx=111"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative w-full h-[150px] rounded overflow-hidden hover:opacity-90 transition duration-300">
              <Image
                src="/image/map.png"
                alt="Map"
                fill
                className="object-cover"
              />
            </div>
          </a>

          <p className="mt-6 font-medium">Follow Us</p>
        </div>
      
      </div>

      {/* Divider */}
      <div className="border-t border-[#853A12]" />

      {/* Copyright */}
      <div className="text-center text-md py-4">
        Copyright © 2026 Motiraj Plywoods All Right Reserved. Designed By Webdesire
      </div>

      {/* Big Text */}
      <div className="border-t border-[#853A12]">
        <div className="text-center py-10">
          <h1 className="text-[70px] md:text-[120px] font-bold tracking-wide text-white/90">
            MOTIRAJ PLYWOODS
          </h1>
        </div>
      </div>
                
    </footer>
  );
};

export default Footer;