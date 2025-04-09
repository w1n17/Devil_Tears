"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: string;
  image_url: string;
  description: string;
  sizes: string[];
  isActive: boolean;
  onClick: () => void;
  addToCart: (productId: number, size: string) => void;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  image_url,
  description,
  sizes,
  isActive,
  onClick,
  addToCart,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) await checkFavoriteStatus(user.id);
    };
    checkAuth();
  }, []);

  const checkFavoriteStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("favourites")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", id);

      if (error) {
        console.error("Ошибка при проверке избранного:", error);
        return;
      }

      setIsFavorite(data && data.length > 0);
    } catch (error) {
      console.error("Ошибка при проверке избранного:", error);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Для добавления в избранное войдите в аккаунт");
      return;
    }

    if (!selectedSize) {
      alert("Пожалуйста, выберите размер перед добавлением в избранное");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("favourites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", id);
      } else {
        await supabase
          .from("favourites")
          .insert([{ user_id: user.id, product_id: id }]);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleSizeSelect = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSize(size === selectedSize ? null : size);
  };

  if (!isActive) {
    return (
      <div className="relative z-0">
        <div className="relative cursor-pointer">
          <div
            className="bg-gradient-to-tr from-[#544545] from-50% to-[#B84747] rounded-3xl transition-all duration-300 relative w-64 h-96 m-4 hover:scale-105"
            onClick={onClick}
          >
            <div className="flex flex-col h-full p-4 justify-between">
              <div className="text-center">
                <div className="text-white text-2xl font-caveat mb-2">
                  {category}
                </div>
                <img
                  src={image_url}
                  alt={name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h1 className="text-2xl text-white font-alegreya mb-2">
                  {name}
                </h1>
              </div>
              <div className="text-xl text-white font-alegreya text-center">
                {price}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[800px] mx-auto bg-gradient-to-tr from-[#544545] from-50% to-[#B84747] rounded-3xl relative p-5 sm:p-10">
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-5 left-5 p-2 bg-white/90 rounded-full hover:bg-red-500 transition-colors z-10"
      >
        <img
          src={
            isFavorite
              ? "/images/header/check_mark.png"
              : "/images/header/Heart.png"
          }
          alt="Избранное"
          className="w-5 h-5"
        />
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <img
          src={image_url}
          alt={name}
          className="w-full md:w-1/2 h-60 md:h-80 object-cover rounded-lg"
        />
        <div className="w-full md:w-1/2 text-left flex flex-col justify-center gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row md:items-baseline gap-2">
            <span className="text-white text-xl md:text-2xl font-alegreya">
              {category}
            </span>
            <h1 className="text-xl md:text-2xl text-white font-alegreya">
              {name}
            </h1>
          </div>
          <div className="space-y-4 md:space-y-6">
            <p className="text-sm md:text-base text-white font-alegreya">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeSelect(size, e)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    selectedSize === size
                      ? "bg-[#B84747] border-2 border-white"
                      : "bg-[#D9D9D9] hover:bg-[#c0c0c0]"
                  }`}
                  aria-pressed={selectedSize === size}
                >
                  <span
                    className={`text-xl font-alegreya ${
                      selectedSize === size ? "text-white" : "text-black"
                    }`}
                  >
                    {size}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xl md:text-2xl text-white font-alegreya">
                {price}
              </span>
              <button
                className="mt-4 bg-white text-black px-6 py-3 w-full md:w-52 rounded-full font-alegreya hover:bg-opacity-90 transition"
                onClick={() => addToCart(id, selectedSize!)}
                disabled={!selectedSize}
              >
                В КОРЗИНУ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
