"use client";
import React, { useState } from "react";
import { InputH } from "./InputH";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const CartAfter = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    country: "Россия",
    address: "",
    postal_code: "",
    phone: "+7",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.full_name.trim()) throw new Error("Укажите ФИО");
      if (!formData.address.trim()) throw new Error("Укажите адрес");
      if (!formData.phone.match(/^\+7\d{10}$/))
        throw new Error("Некорректный телефон");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Авторизуйтесь для оформления");

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartError || !cart) throw new Error("Ошибка загрузки корзины");

      const { data: cartItems, error: itemsError } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("cart_id", cart.id);

      if (itemsError || !cartItems?.length) throw new Error("Корзина пуста");

      const total_price = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            total_price,
            status: "в обработке",
            ...formData,
          },
        ])
        .select()
        .single();

      if (orderError || !order) throw new Error("Ошибка создания заказа");

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsErrorInsert } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsErrorInsert) throw new Error("Ошибка добавления товаров");

      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);

      if (clearError) throw new Error("Ошибка очистки корзины");

      router.push("/Profile");
    } catch (error: any) {
      alert(error.message || "Произошла ошибка");
      console.error("Order Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .replace(/^7/, "+7")
      .substring(0, 12);

    setFormData((prev) => ({
      ...prev,
      phone: value.length > 1 ? `+7${value.slice(2)}` : "+7",
    }));
  };

  return (
    <div className="flex flex-col items-center mt-14">
      <div className="w-[500px] min-h-[500px]">
        <h1 className="text-xl font-caveat font-semibold mb-5 text-left">
          {" "}
          ПОЛУЧАТЕЛЬ
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 items-center"
        >
          <InputH
            title="ФИО"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
          />

          <InputH
            title="СТРАНА"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
          />

          <InputH
            title="АДРЕС"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <InputH
            title="ПОЧТОВЫЙ ИНДЕКС"
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            maxLength={6}
          />

          <InputH
            title="ТЕЛЕФОН"
            value={formData.phone}
            onChange={handlePhoneChange}
            maxLength={12}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-52 h-12 border-2 rounded-full text-xl font-alegreya mx-auto
              ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "border-black hover:bg-[#9F3A3A] hover:text-white"
              }`}
          >
            {loading ? "Обработка..." : "ОФОРМИТЬ ЗАКАЗ"}
          </button>
        </form>
      </div>
    </div>
  );
};
