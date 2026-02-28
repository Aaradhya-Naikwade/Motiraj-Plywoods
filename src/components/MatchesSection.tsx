"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const MatchesSection = () => {
  const [activeTab, setActiveTab] = useState('Foam & Sofa Materials');
  const categories = ['Foam & Sofa Materials', 'Wooden Doors', 'Modular Kitchens'];
  
  const products = [
    { id: 1, name: 'Syltherine', desc: 'Stylish cafe chair 214x87.8cm', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/matches.png' },
    { id: 2, name: 'Syltherine', desc: 'Stylish cafe chair 214x87.8cm', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/matches.png' },
    { id: 3, name: 'Syltherine', desc: 'Stylish cafe chair 214x87.8cm', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/matches.png' },
    { id: 4, name: 'Syltherine', desc: 'Stylish cafe chair 214x87.8cm', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/matches.png' },
  ];

  return (
    <section className="w-full py-16 bg-[#FCF8F3]">
      <div className="max-w-[1440px] mx-auto px-4 md:pl-10 md:pr-0">
        <h2 className="text-4xl md:text-5xl font-bold text-[#3A3A3A] mb-8">Matches For You</h2>
        
        {/* Tabs with Underline as per image_c5c3e0.png */}
        <div className="flex flex-wrap gap-0 mb-12 border border-[#B88E2F] w-fit rounded-lg overflow-hidden bg-white">
          {categories.map((cat) => (
            <div key={cat} className="relative">
              <button
                onClick={() => setActiveTab(cat)}
                className={`px-8 py-4 text-sm md:text-base font-medium transition-all border-r border-[#B88E2F] 
                  ${activeTab === cat ? 'text-black' : 'text-gray-500'}
                `}
              >
                {cat}
              </button>
              {activeTab === cat && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#8D421E] rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Swiper Slider with 3.2 view to show 4th card peeking */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.2 }, 
          }}
          className="pb-14"
        >
          {products.map((p) => (
         <SwiperSlide key={p.id}>
  <div className="bg-white border border-[#B88E2F]/30 rounded-xl overflow-hidden">

    {/* Image Section */}
    <div className="relative w-full h-36">
      <Image
        src={p.image}
        alt={p.name}
        fill
        className="object-cover"
      />

      <div className="absolute top-3 right-3 bg-[#8D421E] text-white rounded-full px-3 py-1 text-xs font-bold">
        {p.discount}
      </div>
    </div>
                  
    {/* Content */}
    <div className="p-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-[#3A3A3A]">{p.name}</h3>

        <div className="flex gap-1 items-center">
          <span className="w-3 h-3 rounded-full bg-[#C1A7E2]" />
          <span className="w-3 h-3 rounded-full bg-[#62968C]" />
          <span className="w-3 h-3 rounded-full bg-[#A3B18A]" />
          <span className="w-3 h-3 rounded-full bg-[#E07A5F]" />
          <span className="text-xs text-gray-500 ml-1">+7</span>
        </div>
      </div>

      <p className="text-[#898989] text-sm mb-3">{p.desc}</p>

      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-[#3A3A3A]">{p.price}</span>
        <span className="text-[#B0B0B0] line-through text-sm">{p.oldPrice}</span>
      </div>
    </div>

  </div>
</SwiperSlide>
          ))}x
        </Swiper>
      </div>
    </section>
  );
};

export default MatchesSection;