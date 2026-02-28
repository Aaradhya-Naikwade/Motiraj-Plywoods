"use client";
import React, { useState } from 'react';
import Image from 'next/image';
const WhyShopSection = () => {
  const features = [
    { title: 'High Quality', sub: 'crafted from top materials', icon: '/image/trophy.png' },
    { title: 'Warranty Protection', sub: 'Over 2 years', icon: '/image/warranty.png' },
    { title: 'Free Shipping', sub: 'Order over ₹30K', icon: '/image/shipping.png' },
    { title: '24 / 7 Support', sub: 'Dedicated support', icon: '/image/support.png' },
  ];

  return (
    <section className="w-full bg-[#A38A6A] py-20 px-4 md:px-10">

          <h2 className="text-white text-center text-4xl md:text-5xl font-bold mb-16 tracking-tight">
          Why Shop With Motiraj Plywoods
        </h2>
        
      <div className="max-w-7xl mx-auto border-2 border-white/50 rounded-[40px] p-8 md:p-16">
      

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12">
          {features.map((f, index) => (
            <div 
              key={f.title} 
              className={`flex flex-col items-center text-center text-white px-6 relative
                ${index !== features.length - 1 ? 'lg:after:content-[""] lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:h-20 lg:after:w-[1px] lg:after:bg-white/30' : ''}`}
            >
              <div className="relative w-20 h-20 mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <Image 
                  src={f.icon} 
                  alt={f.title} 
                  width={40} 
                  height={40} 
                  className="object-contain brightness-0 invert" 
                />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyShopSection;