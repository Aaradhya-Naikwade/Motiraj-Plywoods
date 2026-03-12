"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

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
  const mobileIcons: Record<string, string> = {
    Gallery: "/image/Gallery.png",
    Products: "/image/Products.png",
    Decorative: "/image/Decorative.png",
    Hardware: "/image/Hardware.png",
    Laminates: "/image/Laminaties.png",
  };

  useEffect(() => {
    if (!activeTab) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeTab]);

  const handleRedirect = (item: string) => {
    const slug = item.toLowerCase().replace(/\s+/g, "-");
    setActiveTab(null);
    router.push(`/catalog/${slug}`);
  };

  return (
    <section className="relative w-full">
      <nav className="relative z-30 hidden w-full border-b border-t border-gray-300 bg-[var(--secondary)] md:flex md:flex-nowrap">

        {navItems.map((item) => (
          <div key={item} className="relative min-w-[50%] flex-1 border-r border-gray-300 last:border-r-0 md:min-w-0">

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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d9ccbc] bg-[var(--secondary)] shadow-[0_-10px_28px_rgba(0,0,0,0.1)] md:hidden">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(isActive ? null : item)}
                className="relative flex min-h-[72px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2 text-black"
              >
                <span
                  className={`absolute left-2 right-2 top-0 h-1 rounded-b-full transition ${
                    isActive ? "bg-[var(--primary)]" : "bg-transparent"
                  }`}
                />
                <Image
                  src={mobileIcons[item]}
                  alt={item}
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain"
                />
                <span className={`text-[10px] font-semibold leading-tight ${isActive ? "text-[var(--primary)]" : "text-black"}`}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab ? (
        <div className="fixed inset-0 z-50 bg-[var(--secondary)] md:hidden">
          <div className="flex h-full flex-col px-5 pb-24 pt-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#d8ccbd] pb-3">
              <div className="flex items-center gap-3">
                <Image
                  src={mobileIcons[activeTab]}
                  alt={activeTab}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--darkgray)]">Explore</p>
                  <h2 className="mt-0.5 text-xl font-semibold text-[var(--black)]">{activeTab}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8ccbd] bg-white text-[var(--black)] shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto">
              <ul className="space-y-2.5">
                {menuData[activeTab].map((subItem) => (
                  <li key={subItem}>
                    <button
                      type="button"
                      onClick={() => handleRedirect(subItem)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#d8ccbd] bg-white px-4 py-3.5 text-left text-[15px] font-medium text-[var(--black)] shadow-sm transition active:scale-[0.99]"
                    >
                      <span>{subItem}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

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
