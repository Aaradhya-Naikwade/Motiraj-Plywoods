import React from 'react';
import Image from 'next/image';

const Features = () => {
  const ranges = [
    { title: 'Home', image: '/image/f1.png' }, 
    { title: 'Office', image: '/image/f2.png' },
    { title: 'Bedroom', image: '/image/f3.png' },
  ];

  return (
    <section className="w-full py-16 px-4 md:px-10 bg-white">
      {/* --- Section 1: Browse The Range --- */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#333333]">Browse The Range</h2>
        <p className="text-gray-500 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
        {ranges.map((item) => (
          <div key={item.title} className="flex flex-col items-center group cursor-pointer">
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-6 text-xl font-bold text-[#333333]">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* --- Section 2: Local Expert Banner --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden shadow-sm border border-gray-100">
        {/* Left: Image */}
        <div className="md:w-1/2 relative h-[300px] md:h-auto">
          <Image
            src="/image/explore.png"
            alt="Local Expert"
            fill
            className="object-cover"
          />
        </div>

        {/* Right: Content */}
        <div className="md:w-1/2 bg-[#f9f1e7] p-8 md:p-12 flex flex-col justify-center items-start">
          <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
            Find The Best Local Expert , For Every Task
          </h2>
          <p className="text-gray-600 mt-4 text-sm md:text-base">
            View Portfolios Of Top-Rated Carpenters, Seller, And More. 
            And Contact Verified Professionals Directly.
          </p>
          
          <button className="mt-8 bg-white text-[#b88e2f] border border-[#b88e2f] px-8 py-3 rounded shadow-md font-semibold hover:bg-[#b88e2f] hover:text-white transition-all duration-300">
            Explore Vendors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;