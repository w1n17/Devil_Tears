"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  image_url: string;
  category: string;
}

interface CartItem {
  cart_id: string;
  product_id: number;
  size: string;
  quantity: number;
  product: Product;
  created_at: string;
}

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [delivery, setDelivery] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("Пожалуйста, войдите в систему");
          return;
        }

        const { data: cart, error: cartError } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (cartError) throw cartError;

        const { data: cartData, error } = await supabase
          .from("cart_items")
          .select(`*, product:products(*)`)
          .eq("cart_id", cart.id);

        if (error) throw error;

        if (cartData) {
          const total = cartData.reduce(
            (sum, item) => sum + (item.product?.price || 0) * item.quantity,
            0
          );

          setCartItems(cartData as CartItem[]);
          setSubtotal(total);
        }
      } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const removeFromCart = async (item: CartItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("cart_items").delete().match({
        cart_id: item.cart_id,
        product_id: item.product_id,
        size: item.size,
      });

      if (error) throw error;

      setCartItems((prev) =>
        prev.filter(
          (i) =>
            i.product_id !== item.product_id ||
            i.size !== item.size ||
            i.cart_id !== item.cart_id
        )
      );

      setSubtotal((prev) => prev - item.product.price * item.quantity);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Ошибка при удалении товара");
    }
  };

  const handleDeliveryChange = (price: number) => {
    setDelivery(price);
  };

  const totalPrice = subtotal + delivery;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-alegreya">Загрузка корзины...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center font-alegreya w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="border-2 border-black rounded-3xl w-full max-w-5xl min-h-[500px] p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mt-4 font-caveat">
          Корзина
        </h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="hidden sm:grid sm:grid-cols-6 gap-4 items-center pb-2">
              <div className="col-span-2">Товар</div>
              <div className="text-center">Размер</div>
              <div className="text-center">Количество</div>
              <div className="text-center">Цена</div>
              <div></div>
            </div>

            {cartItems.map((item) => (
              <div
                key={`${item.cart_id}-${item.product_id}-${item.size}`}
                className="flex flex-col sm:grid sm:grid-cols-6 gap-4 items-center py-2 hover:bg-gray-50 transition-colors border-b sm:border-0"
              >
                <div className="w-full sm:col-span-2 flex items-center gap-4">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.product.category}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between w-full sm:justify-center sm:w-auto">
                  <span className="sm:hidden">Размер:</span>
                  <span>{item.size}</span>
                </div>

                <div className="flex justify-between w-full sm:justify-center sm:w-auto">
                  <span className="sm:hidden">Количество:</span>
                  <span>{item.quantity}</span>
                </div>

                <div className="flex justify-between w-full sm:justify-center sm:w-auto">
                  <span className="sm:hidden">Цена:</span>
                  <span>
                    {(item.product.price * item.quantity).toLocaleString(
                      "ru-RU"
                    )}{" "}
                    ₽
                  </span>
                </div>

                <div className="flex justify-end w-full sm:justify-center sm:w-auto">
                  <button
                    onClick={() => removeFromCart(item)}
                    className="text-2xl text-[#544545] hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-xl">Ваша корзина пуста</p>
          </div>
        )}

        <div className="mt-8 px-2 sm:px-6">
          <h2 className="text-xl font-semibold mb-4">Способ доставки</h2>

          <fieldset className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="standard"
                name="delivery"
                onChange={() => handleDeliveryChange(400)}
                className="appearance-none w-4 h-4 border-2 border-slate-500 rounded-full checked:bg-red-300"
              />
              <label htmlFor="standard" className="text-sm">
                Стандартная доставка (400 ₽)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="express"
                name="delivery"
                onChange={() => handleDeliveryChange(600)}
                className="appearance-none w-4 h-4 border-2 border-slate-500 rounded-full checked:bg-red-300"
              />
              <label htmlFor="express" className="text-sm">
                Экспресс доставка (600 ₽)
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col items-end mt-8 gap-2">
            <div className="flex gap-4">
              <span>Товары:</span>
              <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex gap-4">
              <span>Доставка:</span>
              <span>{delivery.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex gap-4 font-bold text-lg">
              <span>Итого:</span>
              <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>

          <Link href="/CartAfter" legacyBehavior passHref>
            <div className="flex justify-center mt-8">
              <button
                className="text-black px-8 py-3 rounded-full border-black border-2 hover:bg-[#9F3A3A] hover:text-white transition-colors w-44"
                disabled={!delivery}
              >
                ДАЛЕЕ
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
