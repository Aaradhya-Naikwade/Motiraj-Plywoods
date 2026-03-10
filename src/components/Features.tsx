import React from 'react';
import Image from 'next/image';

const Features = () => {
  const ranges = [
    { title: 'Home', image: '/image/f1.png' },
    { title: 'Office', image: '/image/f2.png' },
    { title: 'Bedroom', image: '/image/f3.png' },
  ];

  return (
    <section className="w-full bg-white px-4 py-10 md:px-8 md:py-12">
      {/* --- Section 1: Browse The Range --- */}
      <div className="mb-8 text-center md:mb-10">
        <h2 className="text-2xl font-bold text-[#333333] md:text-3xl">Browse The Range</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 md:text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="mx-auto mb-14 grid max-w-6xl grid-cols-1 gap-5 md:mb-16 md:grid-cols-3 md:gap-6">
        {ranges.map((item) => (
          <div key={item.title} className="group cursor-pointer">
            <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/4.6] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 text-center text-lg font-semibold text-[#333333] md:text-xl">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* --- Section 2: Local Expert Banner --- */}
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#efe3d5] bg-[#fcf7f1] shadow-[0_12px_40px_rgba(140,110,80,0.10)] md:flex-row">
        {/* Left: Image */}
        <div className="relative h-[220px] md:h-auto md:w-[47%]">
          <Image
            src="/image/explore.png"
            alt="Local Expert"
            fill
            className="object-cover"
          />
        </div>

        {/* Right: Content */}
        <div className="flex flex-col items-start justify-center bg-[#fcf7f1] p-6 md:w-[53%] md:p-9">
          <h2 className="text-2xl font-bold leading-tight text-black md:text-[30px]">
            Find The Best Local Expert , For Every Task
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
            View Portfolios Of Top-Rated Carpenters, Seller, And More.
            And Contact Verified Professionals Directly.
          </p>

          {/* <button className="mt-6 rounded-full border border-[#b88e2f] bg-white px-6 py-2.5 text-sm font-semibold text-[#b88e2f] shadow-sm transition-all duration-300 hover:bg-[#b88e2f] hover:text-white md:px-7 md:py-3">
            Explore Vendors
          </button> */}
          <div className="inline-block p-[2px] bg-gradient-to-r from-[#947A57] to-[#F5F2EE] rounded-tl-3xl mt-6">
            <button className="bg-white text-black px-8 py-3 text-sm font-medium shadow-md rounded-tl-3xl">
              Explore Vendors
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
