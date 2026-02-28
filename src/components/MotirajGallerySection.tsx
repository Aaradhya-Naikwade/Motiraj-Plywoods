"use client";

const MotirajGallerySection = () => {
  return (
    <section className="w-full bg-[#F2F2F2] py-20">

      {/* Heading (kept centered with normal container) */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 text-center mb-16">
        <p className="text-gray-500 text-sm">
          Share your setup with
        </p>
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-800 mt-2">
          #Ratlamiinterio Plywoods
        </h2>
      </div>

      {/* FULL WIDTH IMAGE */}
      <div
        className="w-full h-[700px] bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('/image/gallery-layout.png')" }}
      />

    </section>
  );
};

export default MotirajGallerySection;