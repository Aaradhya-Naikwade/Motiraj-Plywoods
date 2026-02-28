"use client";
import Image from "next/image";

const NewArrivalSection = () => {
    return (
        <section className="w-full bg-[#BBA085]/40 py-20 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <h2 className="text-5xl font-semibold text-black mb-12">
                    New Arrival
                </h2>

                {/* Main Layout */}
                <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">

                    {/* LEFT SIDE */}
                    <div className="relative rounded-xl overflow-hidden h-[520px]">

                        <Image
                            src="/image/sofa-main.png"
                            alt="Bed Com Sofa"
                            fill
                            className="object-cover"
                        />
                        
                        <div className="absolute inset-0 flex flex-col justify-between items-center py-10">
                            <h3 className="text-white text-3xl tracking-wide text-center">
                                BED COM SOFA
                            </h3>

                            {/* <button className="bg-white text-black px-8 py-3 text-sm font-medium shadow-md">
                                EXPLORE NOW
                            </button> */}

                            <div className="inline-block p-[2px] bg-gradient-to-r from-[#947A57] to-[#F5F2EE] rounded-tl-3xl">
                                <button className="bg-white text-black px-8 py-3 text-sm font-medium shadow-md rounded-tl-3xl">
                                    EXPLORE NOW
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE GRID */}
                    <div className="grid grid-cols-2 gap-6 h-[520px]">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-6">
                            <div className="relative rounded-xl overflow-hidden h-[320px]">
                                <Image
                                    src="/image/sofa-small.png"
                                    alt="Sofa"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="relative rounded-xl overflow-hidden h-[180px]">
                                <Image
                                    src="/image/sofa-small.png"
                                    alt="Sofa"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-6">
                            <div className="relative rounded-xl overflow-hidden h-[220px]">
                                <Image
                                    src="/image/sofa-small.png"
                                    alt="Sofa"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="relative rounded-xl overflow-hidden h-[280px]">
                                <Image
                                    src="/image/sofa-small.png"
                                    alt="Sofa"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default NewArrivalSection;