
"use client";
import Image from "next/image";

const LuxuryExperienceSection = () => {
  return (
    <section
      className="w-full overflow-hidden py-16 md:py-20 px-4 sm:px-6 lg:px-10 bg-cover bg-center"
      style={{ backgroundImage: "url('/image/wood-bg.png')" }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* LEFT SIDE IMAGES */}
        <div className="relative flex justify-center lg:justify-start h-[380px] sm:h-[450px]">

          {/* Back Card */}
          <div
            className="absolute
            w-[150px] sm:w-[190px] lg:w-[230px]
            h-[260px] sm:h-[340px] lg:h-[440px]
            rounded-xl overflow-hidden shadow-2xl
            left-[15%] sm:left-[20%] top-[25%]"
          >
            <Image
              src="/image/sofa-main.png"
              alt="Luxury Sofa"
              fill
              className="object-cover"
            />
          </div>
        
          {/* Front Card */}
          <div
            className="absolute
            w-[170px] sm:w-[210px] lg:w-[250px]
            h-[280px] sm:h-[360px] lg:h-[460px]
            rounded-xl overflow-hidden shadow-2xl
            left-[40%] sm:left-[45%] top-[5%] z-10"
          >
            <Image
              src="/image/sofa-main.png"
              alt="Luxury Sofa"
              fill
              className="object-cover"
            />
          </div>

        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="text-white text-center lg:text-left px-2">

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
            The Luxury Experience <br />
            You’ll Remember
          </h2>

          <div className="mt-4 w-16 h-[3px] bg-[#C56B2E] mx-auto lg:mx-0" />

          <p className="mt-6 text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Ratlamiinterio Plywoods brings luxury in comfort to your homes and
            offices with a complete range of premium plywood, designer
            doors, and modular solutions, all crafted to deliver high-end
            elegance at an affordable price.
          </p>

          <div className="mt-8 inline-block p-[2px] bg-gradient-to-r from-[#947A57] to-[#F5F2EE] rounded-tl-3xl">
            <button className="bg-white text-black px-6 sm:px-8 py-3 text-sm font-medium shadow-md rounded-tl-3xl">
              EXPLORE NOW
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LuxuryExperienceSection;