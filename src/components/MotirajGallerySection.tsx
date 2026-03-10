"use client";

const MotirajGallerySection = () => {
  return (
    <section className="w-full bg-white py-20 md:bg-[#F2F2F2]">

      {/* Heading (kept centered with normal container) */}
      <div className="max-w-7xl mx-auto mb-16 px-4 pt-6 text-center md:px-10 md:pt-0">
        <p className="text-gray-500 text-sm">
          Share your setup with
        </p>
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-800 mt-2">
          #Ratlamiinterio Plywoods
        </h2>
      </div>
      
      {/* FULL WIDTH IMAGE */}
      <div
        className="block h-[520px] w-full bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/image/mobile-gallery.jpeg')" }}
      />
      <div
        className="hidden h-[700px] w-full bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/image/gallery-layout.png')" }}
      />

    </section>
  );
};

export default MotirajGallerySection;
