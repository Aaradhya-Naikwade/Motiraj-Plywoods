"use client";
import Image from "next/image";

const LoveSection = () => {
  const testimonials = [
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Motiraj Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Motiraj Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Motiraj Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
    {
      name: "Hemant Tripathi",
      text: "New Sagan Door Mica Wallpapers Plywood Hardware. Designs Available Motiraj Plywood",
      avatar: "/image/user.jpg",
      product: "/image/product.png",
    },
  ];

  return (
    <section className="w-full bg-[#ECE8E3] py-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-10 items-center">

        {/* LEFT PANEL */}
        <div className="bg-[#E5DED6] rounded-2xl p-14 relative h-full">
          <span className="absolute top-6 left-8 text-6xl text-[#8B3F17]">“</span>
          <div className="absolute top-12 left-20 right-16 h-[1px] bg-[#CBBFB1]" />

          <div className="mt-16">
            <h2 className="text-[44px] leading-[52px] font-semibold text-[#8B3F17]">
              See Why <br /> They Love Us
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Trusted By Over 10 thousand Customers
            </p>

            <div className="mt-8 w-36 h-[1px] bg-[#CBBFB1]" />
          </div>

          <span className="absolute bottom-6 right-8 text-6xl text-[#8B3F17]">
            ”
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid md:grid-cols-2 gap-8">

          {testimonials.map((item, index) => (
            <div
              key={index}
              className="relative bg-[#EFEAE4] rounded-xl px-8 py-8 shadow-sm min-h-[190px]"
            >
              {/* CONTENT WRAPPER (controls width safely) */}
              <div className="max-w-[70%]">

                <div className="flex items-center gap-4">
                  {/* Profile Image */}
                  <div className="w-14 h-14 relative rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.text}
                    </p>

                    <p className="mt-3 text-sm font-medium text-gray-800">
                      {item.name}
                      <span className="ml-2 text-yellow-500 text-xs">
                        ★★★★★
                      </span>
                    </p>
                  </div>
                </div>

              </div>

              {/* PRODUCT IMAGE */}
              <div className="absolute -top-0 right-0 w-[140px]">
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