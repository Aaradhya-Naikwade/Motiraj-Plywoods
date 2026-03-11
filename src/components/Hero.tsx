"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();

  const menuData: Record<string, string[]> = {
    Gallery: [
      "Bed n Cabinets",
      "Decoratives n Temple",
      "Door",
      "Exteriors",
      "Furnishing",
      "Kitchen",
      "LED",
      "Partition In Panels",
      "Shop n Office",
      "Sofa",
    ],

    Products: [
      "Bath Accessories",
      "Decoratives",
      "Door Lock n Kits",
      "Hardware n Other Items",
      "Locks Pics",
      "Sofa Leg And Curtain Bracket",
    ],

    Decorative: [
      "8-2 Panel",
      "8-4 Panel Sheets",
      "Charcoal",
      "Leather Panel",
      "Louvers Premium",
      "Premium CNC",
      "Rafters Louvers",
      "Vineer Teak",
      "Wallpapers",
      "Other Mix Decoratives",
    ],

    Laminates: [
      "Mica .8mm",
      "Mica .95mm",
      "Mica 1mm",
      "Mica Acrylic",
      "Mica Asa Sheet Pastle",
      "Mica Digital",
      "Mica Door Skin",
      "Mica Liner",
      "Mica Pastle Colour",
      "Mica Premium",
      "Mica PVC",
      "PVC Door Designs",
    ],

    Hardware: [
      "Bath Accessories",
      "Door kit",
      "Handle Lock",
      "Kitchen Accessories",
      "Pull Handle",
    ],
  };

  const navItems = ["Gallery", "Products", "Decorative", "Laminates", "Hardware"];

  const handleRedirect = (item: string) => {
    const slug = item.toLowerCase().replace(/\s+/g, "-");
    router.push(`/catalog/${slug}`);
  };

  return (
    <section className="relative w-full">

      <nav className="flex flex-wrap md:flex-nowrap w-full border-t border-b border-gray-300 bg-[var(--secondary)] relative z-30">

        {navItems.map((item) => (
          <div key={item} className="relative flex-1 min-w-[50%] md:min-w-0 border-r border-gray-300 last:border-r-0">

            <button
              onClick={() =>
                setActiveTab(activeTab === item ? null : item)
              }
              className={`w-full py-3 md:py-4 text-sm md:text-lg font-medium capitalize transition-all
              ${activeTab === item
                  ? "bg-[var(--darkb)] text-white"
                  : "text-black hover:bg-black/5"
                }`}
            >
              {item}
            </button>

            <div
              className={`
              absolute left-0 top-full w-full z-40
              transition-all duration-300 ease-in-out
              ${activeTab === item
                  ? "max-h-[70vh] overflow-y-auto opacity-100"
                  : "max-h-0 overflow-hidden opacity-0 pointer-events-none"
                }
              `}
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              <ul className="flex flex-col py-4">

                {menuData[item].map((subItem) => (
                  <li
                    key={subItem}
                    onClick={() => handleRedirect(subItem)}
                    className="px-5 md:px-6 py-2 text-sm md:text-base text-black
                    hover:bg-white/10 cursor-pointer transition"
                  >
                    {subItem}
                  </li>
                ))}

              </ul>
            </div>

          </div>
        ))}
      </nav>

      <div className="relative w-full overflow-hidden leading-[0]">
        <img
          src="/image/hero.png"
          alt="Hero Banner"
          className="hidden w-full h-auto object-contain md:block"
        />
        <img
          src="/image/mobile-hero.jpeg"
          alt="Hero Banner"
          className="block w-full h-auto object-contain md:hidden"
        />

        {/* <div className="absolute bottom-6 left-4 z-20 md:hidden">
          <div className="inline-block rounded-tl-3xl bg-gradient-to-r from-[#947A57] to-[#F5F2EE] p-[2px]">
            <button className="flex items-center gap-2 rounded-tl-3xl bg-white px-6 py-3 text-sm font-medium text-black shadow-md">
              <Video size={16} />
              <span>Check Via Video call</span>
            </button>
          </div>
        </div> */}

        <div className="w-full flex h-2 md:h-3">
          <div className="flex-[1.5] bg-[var(--primary)]"></div>
          <div className="flex-1 bg-[#a38a6a]"></div>
          <div className="flex-1 bg-[#d6c1a5]"></div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
