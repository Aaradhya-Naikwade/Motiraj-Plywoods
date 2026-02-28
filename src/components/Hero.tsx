"use client";
import React, { useState } from 'react';

const Hero = () => {
  const [activeTab, setActiveTab] = useState<string | null>('Gallery');

  const menuData: Record<string, string[]> = {
    Gallery: ["Bad In Cabineta", "Door", "Decoratives N Temple", "Exteriors", "Kitchen", "Sofa", "Partition In Panels", "Shop N Office"],
    Products: ["Plywood", "Flush Doors", "Block Boards"],
    Decorative: ["Veneers", "Wall Panels", "Highlighters"],
    Laminates: ["Sunmica", "PVC Laminates", "Acrylic Sheets"],
    hardware: ["Handles", "Locks", "Hinges", "Channels"]
  };

  const navItems = ['Gallery', 'Products', 'Decorative', 'Laminates', 'hardware'];

  return (
    <section className="relative w-full">
      {/* 1. Navigation Bar */}
      <nav className="flex w-full border-t border-b border-gray-300 bg-[var(--secondary)] relative z-30">
        {navItems.map((item) => (
          <div key={item} className="flex-1 relative border-r border-gray-400 last:border-r-0">
        <button 
  onClick={() => setActiveTab(activeTab === item ? null : item)}
  className={`w-full py-3 text-sm md:text-lg font-medium capitalize transition-all outline-none
    ${activeTab === item 
      ? 'bg-[var(--darkb)] text-white' // Active Tab ka solid color
      : 'text-black hover:bg-black/5'
    }
  `}
>
              {item}
            </button>

            {/* 2. Dropdown Fix: Exact Color Match with Transparency */}
        {activeTab === item && (
  <div 
    className="absolute left-0 top-full w-full z-40 border-t border-white/10 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200"
    style={{ 
      height: 'fit-content',
      // Direct variable use kar rahe hain
      backgroundColor: 'var(--primary)', 
      // Opacity ke liye hum yahan filter ya opacity property bhi laga sakte hain
      opacity: '0.9', 
      backdropFilter: 'blur(8px)',
    }}
  >
    <ul className="flex flex-col py-4">
      {menuData[item].map((subItem) => (
        <li 
          key={subItem} 
          className="px-6 py-2 hover:bg-white/10 transition-colors cursor-pointer text-sm md:text-base font-normal text-black"
        >
          {subItem}
        </li>
      ))}
    </ul>
  </div>
)}
          </div>
        ))}
      </nav>

      {/* 3. Hero Image - Using <img> for zero cutting */}
      <div className="relative w-full overflow-hidden leading-[0]">
        <img 
          src="/image/hero.png" 
          alt="Hero Banner" 
          className="w-full h-auto object-contain" // h-auto se niche ka text kabhi nahi kateg
        />

        {/* Bottom Design Strips */}
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