'use client';

import Image from "next/image";
import { Image as ImageIcon, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const VendorProducts = () => {
    const products = [1, 2, 3, 4, 5, 6];

    return (
        <section className="w-full bg-[#f6f3ef] py-20">

            {/* Section Title */}
            <h2 className="text-4xl font-semibold text-center mb-16 text-gray-900">
                Get Skilled Workers On Demand Today
            </h2>

            {/* Cards */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6">
                {products.map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
                    >
                        {/* Image Section */}
                        <div className="relative group">
                            <Image
                                src="/image/plywood.png"
                                alt="Plywood"
                                width={500}
                                height={350}
                                className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                            />

                            {/* Discount Badge */}
                            <div className="absolute top-4 right-4 bg-[#8b3e12] text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                                30% OFF
                            </div>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-white text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                <ImageIcon size={14} />
                                +3
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="px-6 py-6 space-y-2">

                            {/* Title + Profile */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Plywood
                                </h3>
                    
                                <button className="text-sm bg-[#947A57] hover:bg-[#7f6647] transition text-white px-4 py-1.5 rounded-full">
                                    View Profile
                                </button>
                            </div>

                            {/* Price */}
                            {/* <div className="flex items-center gap-3 pt-1">
                                <span className="text-xl font-bold text-gray-900">
                                    ₹2,500
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    ₹3,500
                                </span>
                            </div> */}

                            {/* Location */}
                            <p className="text-sm text-gray-500">
                                Indore
                            </p>

                            {/* Description */}
                            <p className="text-sm text-gray-400">
                                Stylish cafe chair 214×87.8cm
                            </p>
                        </div>

                        {/* Bottom Contact Section */}
                        <div className="flex border-t  border-amber-600  rounded-tr-3xl rounded-tl-3xl">

                            {/* Contact Supplier */}
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#8b3e12] hover:bg-[#6f300e] transition text-white py-4 font-medium rounded-tl-3xl">
                                <Phone size={20} />
                                Contact Supplier
                            </button>

                            {/* WhatsApp */}
                            <button className="w-16 flex items-center justify-center border-l border-gray-100 hover:bg-gray-50 transition rounded-tr-3xl">
                                <FaWhatsapp size={30} className="text-[#8b3e12]" />
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default VendorProducts;