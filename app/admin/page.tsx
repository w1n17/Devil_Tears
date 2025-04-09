"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AdminNav } from "./components/AdminNav";
import { OrdersManager } from "./components/OrdersManager";
import { ProductsManager } from "./components/ProductsManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Требуется авторизация");

        const { data } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!data?.is_admin) throw new Error("Недостаточно прав");
        setIsAdmin(true);
      } catch (err) {
        window.location.href = "/auth/signin";
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-caveat text-3xl">Проверка прав доступа...</div>
      </div>
    );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-caveat text-center mb-6 md:mb-12">
          🛠 Административная панель
        </h1>

        <AdminNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="space-y-6 md:space-y-8">
          {activeTab === "orders" && <OrdersManager />}
          {activeTab === "products" && <ProductsManager />}
        </div>
      </div>
    </div>
  );
}
