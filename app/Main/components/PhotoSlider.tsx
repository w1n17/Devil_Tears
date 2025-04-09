import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoSliderProps {
  image: string;
  isMobile: boolean;
}

export const PhotoSlider = ({ image, isMobile }: PhotoSliderProps) => {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.img
          key={image}
          src={image}
          alt="Product photo"
          className={`object-cover ${
            isMobile
              ? "w-full h-full rounded-2xl"
              : "w-[500px] h-[300px] rounded-3xl"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      </AnimatePresence>
    </div>
  );
};
