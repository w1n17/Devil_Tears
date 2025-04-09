"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Footer = () => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  const buttonVariants = {
    initial: { rotate: 0 },
    clicked: { rotate: 180 },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      height: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-full h-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl">
        <div
          className="flex flex-row items-center justify-between cursor-pointer group"
          onClick={handleClick}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-alegreya group-hover:text-gray-700 transition-colors duration-300">
            СВЯЗАТЬСЯ С НАМИ
          </p>
          <motion.div
            initial="initial"
            animate={clicked ? "clicked" : "initial"}
            variants={buttonVariants}
            transition={{ duration: 0.3 }}
            className="relative w-8 h-8 sm:w-10 sm:h-10"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold transform transition-all duration-300 hover:scale-110">
                {clicked ? "−" : "+"}
              </p>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {clicked && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12">
                <a
                  href="https://t.me/slowe7esclose"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-row items-center gap-2 hover:bg-white/10 p-3 rounded-lg transition-all duration-300"
                >
                  <img
                    src="/images/general/telegram.png"
                    alt="telegram"
                    className="w-7 h-5 sm:w-9 sm:h-6 md:w-11 md:h-7 transition-transform duration-300 group-hover:scale-110"
                  />
                  <p className="text-lg sm:text-xl md:text-2xl font-alegreya">
                    @slowe7esclose
                  </p>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
