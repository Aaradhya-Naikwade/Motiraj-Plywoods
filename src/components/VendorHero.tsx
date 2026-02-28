'use client';

import Image from "next/image";

const VendorHero = () => {
  return (
    <section className="w-full bg-[#ffffff] pt-20 text-center">

      {/* Heading */}
      <div className="px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#7a3b16]">
          Fast, Free Way To Get Experts
        </h1>

        <h2 className="text-2xl md:text-3xl mt-4">
          <span className="text-black">
            Discover Top Experts In India{" "}
          </span>
          <span className="text-[#947A57]">
            Skilled, Trusted, Reliable!
          </span>
        </h2>
      </div>

      {/* Full Width Image */}
      <div className="-mt-10 w-full">
        <Image
          src="/image/vendors-group.png"
          alt="Top Experts"
          width={1920}
          height={800}
          priority
          className="w-full h-auto object-cover"
        />
      </div>

    </section>
  );
};

export default VendorHero;