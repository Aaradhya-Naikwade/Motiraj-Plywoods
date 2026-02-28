"use client";
import Image from "next/image";

const LuxuryExperienceSection = () => {
    return (
        <section
            className="w-full py-20 px-4 md:px-10 bg-cover bg-center"
            style={{ backgroundImage: "url('/image/wood-bg.png')" }}
        >
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

                {/* LEFT SIDE IMAGES */}
                <div className="relative h-[520px] flex items-center">

                    {/* Back Card */}
                    <div className="relative w-[230px] h-[440px] rounded-xl overflow-hidden shadow-2xl mt-30">
                        <Image
                            src="/image/sofa-main.png"
                            alt="Luxury Sofa"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Front Card (Offset, not overlapping heavily) */}
                    <div className="relative w-[250px] h-[460px] rounded-xl overflow-hidden shadow-2xl ml-10 -mt-30 z-10">
                        <Image
                            src="/image/sofa-main.png"
                            alt="Luxury Sofa"
                            fill
                            className="object-cover"
                        />
                    </div>

                </div>

                {/* RIGHT SIDE CONTENT */}
                <div className="text-white">

                    <h2 className="text-5xl font-semibold leading-tight">
                        The Luxury Experience <br />
                        You’ll Remember
                    </h2>

                    <div className="mt-4 w-16 h-[3px] bg-[#C56B2E]" />

                    <p className="mt-6 text-white/90 leading-relaxed max-w-lg">
                        Ratlamiinterio Plywoods brings luxury in comfort to your homes and
                        offices with a complete range of premium plywood, designer
                        doors, and modular solutions, all crafted to deliver high-end
                        elegance at an affordable price.
                    </p>

                    {/* <button className="mt-8 bg-white text-black px-8 py-3 text-sm font-medium shadow-md">
            READ MORE
          </button> */}

                    <div className=" mt-8 inline-block p-[2px] bg-gradient-to-r from-[#947A57] to-[#F5F2EE] rounded-tl-3xl">
                        <button className="bg-white text-black px-8 py-3 text-sm font-medium shadow-md rounded-tl-3xl">
                            EXPLORE NOW
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LuxuryExperienceSection;