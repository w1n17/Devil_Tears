"use client";
import React, { useState } from "react";
import { PhotoSlider } from "./PhotoSlider";

export const Photo = () => {
  const images = [
    "/images/photo/PhotoSlider1.png",
    "/images/photo/PhotoSlider2.jpg",
    "/images/photo/PhotoSlider3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Свайп влево
      nextImage();
    }
    if (touchStart - touchEnd < -75) {
      // Свайп вправо
      prevImage();
    }
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-[#544545]/75 pb-8 sm:pb-12 w-full">
      <h1 className="flex justify-center items-center text-3xl sm:text-4xl md:text-5xl text-black pt-6 sm:pt-8 md:pt-12 font-jaro">
        Photo
      </h1>
      <div className="flex flex-col sm:flex-row justify-center items-center mt-8 sm:mt-16 md:mt-24 gap-6 sm:gap-16 px-4">
        {/* Мобильная версия */}
        <div
          className="relative w-full max-w-[180px] sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full aspect-[3/4] border-4 border-black rounded-2xl rotate-6 transition-all duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-full -rotate-3 transition-all duration-300 overflow-hidden rounded-2xl">
            <PhotoSlider image={images[currentIndex]} isMobile={true} />
          </div>

          {/* Индикаторы для мобильной версии */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Десктопная версия */}
        <div className="hidden sm:flex flex-row items-center gap-16">
          <button
            className="w-20 h-20 rounded-full bg-white flex justify-center items-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
            onClick={prevImage}
            aria-label="Previous image"
          >
            <img
              src="/images/photo/Arrow_left.png"
              alt="Previous"
              className="w-8 h-8"
            />
          </button>

          <div className="relative">
            <div className="w-[500px] h-[300px] border-4 border-black rounded-3xl rotate-6"></div>
            <div className="absolute top-0 left-0 -rotate-3">
              <PhotoSlider image={images[currentIndex]} isMobile={false} />
            </div>
          </div>

          <button
            className="w-20 h-20 rounded-full bg-white flex justify-center items-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
            onClick={nextImage}
            aria-label="Next image"
          >
            <img
              src="/images/photo/Arrow_right.png"
              alt="Next"
              className="w-8 h-8"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
