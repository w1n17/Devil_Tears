import React from "react";
import Image from "next/image";

interface CardProps {
  name: string;
  description: string;
  onDelete?: () => void;
  imageUrl?: string;
}

export const Card = ({ name, description, onDelete, imageUrl }: CardProps) => {
  return (
    <div className="w-full px-3 py-2 hover:bg-black/5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {imageUrl ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 relative rounded-lg overflow-hidden shrink-0">
              <Image src={imageUrl} alt={name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/images/header/Heart.png"
                alt="Favorite"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 font-alegreya text-sm sm:text-base">
              <span className="font-medium truncate">{name}</span>
              <span className="text-gray-600 truncate">{description}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="text-sm sm:text-base font-alegreya text-gray-600 hover:text-red-500 transition-colors duration-200 whitespace-nowrap px-2"
        >
          DELETE
        </button>
      </div>
    </div>
  );
};
