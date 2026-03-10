"use client";
import Image from 'next/image';

const WhyShopSection = () => {
  const features = [
    { title: 'High Quality', sub: 'crafted from top materials', icon: '/image/trophy.png' },
    { title: 'Warranty Protection', sub: 'Over 2 years', icon: '/image/warranty.png' },
    { title: 'Free Shipping', sub: 'Order over ₹30K', icon: '/image/shipping.png' },
    { title: '24 / 7 Support', sub: 'Dedicated support', icon: '/image/support.png' },
  ];

  return (
    <section className="w-full bg-[#A38A6A] px-4 py-10 md:px-8 md:py-14">

          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-white md:mb-10 md:text-4xl">
          Why Shop With Ratlamiinterio Plywoods
        </h2>
        
        
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/40 p-5 md:rounded-[32px] md:p-8">

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-2 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
          {features.map((f, index) => (
            <div 
              key={f.title} 
              className={`relative flex flex-col items-center px-2 text-center text-white md:px-4
                ${index !== features.length - 1 ? 'lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:h-16 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-white/25 lg:after:content-[""]' : ''}`}
            >
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 md:mb-5 md:h-16 md:w-16">
                <Image 
                  src={f.icon} 
                  alt={f.title} 
                  width={30} 
                  height={30} 
                  className="object-contain brightness-0 invert" 
                />
              </div>
              <h3 className="mb-1 text-sm font-bold md:text-lg">{f.title}</h3>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 md:text-xs">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyShopSection;
