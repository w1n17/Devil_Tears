"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "@/Shared/ProductCard/ProductCard";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  image_url: string;
  category: string;
}

export const Catalog = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, sizes, image_url, category")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedData = data.map((product) => ({
          ...product,
          price: Number(product.price),
        }));

        setProducts(formattedData as Product[]);
      } catch (err) {
        setError("Ошибка загрузки товаров");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeCard !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeCard]);

  const addToCart = async (productId: number, size: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Пожалуйста, войдите в систему для добавления в корзину");
        return;
      }

      let cartData: any = null;
      let { data, error } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) {
        const { data: newCart, error: createCartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();

        if (createCartError) throw createCartError;
        cartData = newCart;
      } else {
        cartData = data;
      }

      const { error: insertError } = await supabase.from("cart_items").insert([
        {
          cart_id: cartData.id,
          product_id: productId,
          size,
          quantity: 1,
        },
      ]);

      if (insertError) throw insertError;

      alert("Товар успешно добавлен в корзину!");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      alert("Не удалось добавить товар в корзину");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#B84747]/75 pt-12 z-10 min-h-screen flex justify-center items-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#B84747]/75 pt-12 z-10 min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#B84747]/75 pt-12 z-10 min-h-screen">
      <h1 className="flex justify-center items-center text-5xl text-black font-jaro mb-8">
        Catalog
      </h1>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 max-w-7xl w-full place-items-center">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price.toLocaleString("ru-RU") + " ₽"}
              image_url={product.image_url}
              description={product.description}
              sizes={product.sizes}
              isActive={activeCard === product.id}
              onClick={() =>
                setActiveCard((prev) =>
                  prev === product.id ? null : product.id
                )
              }
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {activeCard !== null && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                className="absolute top-5 right-5 text-white text-3xl z-[100] w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                onClick={() => setActiveCard(null)}
              >
                ×
              </button>
              <ProductCard
                id={activeCard}
                name={products.find((p) => p.id === activeCard)!.name}
                category={products.find((p) => p.id === activeCard)!.category}
                price={
                  products
                    .find((p) => p.id === activeCard)!
                    .price.toLocaleString("ru-RU") + " ₽"
                }
                image_url={products.find((p) => p.id === activeCard)!.image_url}
                description={
                  products.find((p) => p.id === activeCard)!.description
                }
                sizes={products.find((p) => p.id === activeCard)!.sizes}
                isActive={true}
                onClick={() => setActiveCard(null)}
                addToCart={addToCart}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
