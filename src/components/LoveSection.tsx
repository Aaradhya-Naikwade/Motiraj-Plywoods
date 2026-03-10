"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const LoveSection = () => {
  const testimonials = [
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Ratlamiinterio Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Ratlamiinterio Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Ratlamiinterio Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Ratlamiinterio Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
  ];

  return (
    <section className="w-full overflow-hidden bg-[#ECE8E3] px-4 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="relative h-full rounded-2xl bg-[#E5DED6] p-14">
          <span className="absolute left-8 top-6 text-6xl text-[#8B3F17]">“</span>
          <div className="absolute left-20 right-16 top-12 h-[1px] bg-[#CBBFB1]" />

          <div className="mt-16">
            <h2 className="text-[44px] font-semibold leading-[52px] text-[#8B3F17]">
              See Why <br /> They Love Us
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Trusted By Over 10 thousand Customers
            </p>

            <div className="mt-8 h-[1px] w-36 bg-[#CBBFB1]" />
          </div>

          <span className="absolute bottom-6 right-8 text-6xl text-[#8B3F17]">
            ”
          </span>
        </div>

        <div className="w-full overflow-hidden md:hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={12}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="relative min-h-[180px] w-full rounded-xl bg-[#EFEAE4] px-4 py-6 shadow-sm">
                  <div className="max-w-[62%]">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-xs leading-relaxed text-gray-600">
                          {item.text}
                        </p>

                        <p className="mt-3 text-sm font-medium text-gray-800">
                          {item.name}
                          <span className="ml-2 text-xs text-yellow-500">
                            ★★★★★
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 w-[96px]">
                    <Image
                      src={item.product}
                      alt="product"
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden gap-8 md:grid md:grid-cols-2">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="relative min-h-[190px] rounded-xl bg-[#EFEAE4] px-8 py-8 shadow-sm"
            >
              <div className="max-w-[70%]">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs leading-relaxed text-gray-600">
                      {item.text}
                    </p>

                    <p className="mt-3 text-sm font-medium text-gray-800">
                      {item.name}
                      <span className="ml-2 text-xs text-yellow-500">
                        ★★★★★
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-0 w-[140px]">
                <Image
                  src={item.product}
                  alt="product"
                  width={140}
                  height={140}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoveSection;
