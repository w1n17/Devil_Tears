import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Devil Tears Season 2025"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Scrolling Text */}
        <div className="absolute bottom-0 w-full bg-[#BFBFBF]/80 py-2 overflow-hidden">
          <div className="animate-scrollText whitespace-nowrap">
            DEVIL TEARS SEASON 2025 DEVIL TEARS SEASON 2025 DEVIL TEARS SEASON
            2025 DEVIL TEARS SEASON 2025
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="w-full bg-[#B84747] py-16">
        <h2 className="text-4xl sm:text-6xl text-center text-white font-bold mb-8">
          Catalog
        </h2>
        {/* Add your catalog content here */}
      </section>
    </div>
  );
}
