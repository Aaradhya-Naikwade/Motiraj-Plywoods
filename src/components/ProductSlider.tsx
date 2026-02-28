"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const ProductSlider = () => {
  const [activeCategory, setActiveCategory] = useState('Foam & Sofa Materials');

  const categories = ['Foam & Sofa Materials', 'Wooden Doors', 'Modular Kitchens'];
  
  const products = [
    { id: 1, name: 'Syltherine', desc: 'Stylish cafe chair', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/product1.png' },
    { id: 2, name: 'Syltherine', desc: 'Stylish cafe chair', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/product1.png' },
    { id: 3, name: 'Syltherine', desc: 'Stylish cafe chair', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/product1.png' },
    { id: 4, name: 'Syltherine', desc: 'Stylish cafe chair', price: 'Rp 2.500.000', oldPrice: 'Rp 3.500.000', discount: '-30%', image: '/image/product1.png' },
  ];

  return (
    <section className="w-full py-16 bg-[#fcf8f3]">
      {/* --- Section 1: Matches For You Slider --- */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-black mb-8">Matches For You</h2>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-md border transition-all font-medium ${
                activeCategory === cat 
                ? 'bg-[var(--secondary)] border-[var(--primary)] text-black' 
                : 'border-gray-300 text-gray-600 hover:border-[var(--primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Slider */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={25}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-16"
        >
          {products.map((p) => (
            <SwiperSlide key={p.id}>
              <div className="bg-[#f4f5f7] rounded-lg overflow-hidden group relative border border-gray-100 shadow-sm">
                <div className="relative aspect-square">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                  <div className="absolute top-5 right-5 bg-[#e97171] text-white rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold">
                    {p.discount}
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="text-2xl font-bold text-[#3a3a3a]">{p.name}</h3>
                  <p className="text-gray-500 font-medium my-1">{p.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-bold text-[#3a3a3a]">{p.price}</span>
                    <span className="text-gray-400 line-through text-sm">{p.oldPrice}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Section 2: Why Shop With Ratlamiinterio Plywoods --- */}
      <div className="w-full mt-20 bg-[#8b6d4d]/90 py-16 px-4">
        <div className="max-w-7xl mx-auto border border-white/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Why Shop With Ratlamiinterio Plywoods
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center text-white">
            <FeatureItem title="High Quality" sub="crafted from top materials" icon="/image/trophy.png" />
            <FeatureItem title="Warranty Protection" sub="Over 2 years" icon="/image/warranty.png" />
            <FeatureItem title="Free Shipping" sub="Order over ₹30K" icon="/image/shipping.png" />
            <FeatureItem title="24 / 7 Support" sub="Dedicated support" icon="/image/support.png" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Reusable Feature Component
const FeatureItem = ({ icon, title, sub }: { icon: string, title: string, sub: string }) => (
  <div className="flex flex-col items-center gap-4 border-r border-white/20 last:border-0 px-4">
    <div className="relative w-16 h-16 mb-2">
      <Image src={icon} alt={title} fill className="object-contain brightness-0 invert" />
    </div>
    <div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="text-white/70 text-sm mt-1">{sub}</p>
    </div>
  </div>
);

export default ProductSlider;