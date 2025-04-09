"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_price: number;
  order_number?: number;
  order_items: {
    product: {
      name: string;
      image_url: string;
    };
    quantity: number;
    price: number;
  }[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth/signin");
          return;
        }

        setUser(user);

        const { data: ordersData, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            created_at,
            status,
            total_price,
            order_items:order_items(
              quantity,
              price,
              product:product_id(name, image_url)
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (ordersData) {
          const ordersWithNumbers = ordersData.map(
            (order: any, index: number) => ({
              ...order,
              order_number: ordersData.length - index,
            })
          );
          setOrders(ordersWithNumbers as unknown as Order[]);
        }
      } catch (err) {
        setError("Ошибка загрузки заказов");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/Main");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#B84747]/75 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#B84747]/75 flex items-center justify-center">
        <div className="text-white text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#B84747]/75 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-tr from-[#544545] to-[#B84747] rounded-3xl p-8 shadow-xl">
          <h1 className="text-4xl text-white font-caveat mb-8 text-center">
            Ваш профиль
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl text-white font-alegreya mb-6">
                Мои заказы
              </h2>

              {orders.length === 0 ? (
                <div className="text-white/80 text-center py-6">
                  У вас пока нет заказов
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-black/20 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                      <div className="mb-4 md:mb-0">
                        <p className="text-white font-alegreya">
                          Заказ №:{" "}
                          <span className="text-white">
                            #{order.order_number}
                          </span>
                        </p>
                        <p className="text-white text-sm mt-1">
                          {new Date(order.created_at).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm ${
                          order.status === "Доставлен"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "Отменен"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white text-black"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {order.order_items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 border-b border-white/10 pb-4"
                        >
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-white font-alegreya">
                              {item.product.name}
                            </p>
                            <p className="text-white text-sm">
                              {item.quantity} ×{" "}
                              {item.price.toLocaleString("ru-RU")} ₽
                            </p>
                          </div>
                          <p className="text-white font-alegreya">
                            {(item.quantity * item.price).toLocaleString(
                              "ru-RU"
                            )}{" "}
                            ₽
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                      <p className="text-white font-alegreya">Общая сумма:</p>
                      <p className="text-xl text-white font-alegreya">
                        {order.total_price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center mt-12">
              <button
                onClick={handleLogout}
                className="bg-white text-black px-8 py-3 rounded-full font-alegreya 
                          hover:bg-opacity-90 transition-all duration-300 text-lg"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/Main"
            className="text-white/80 font-alegreya hover:text-white transition hover:underline"
          >
            ← Вернуться в магазин
          </Link>
        </div>
      </div>
    </div>
  );
}
