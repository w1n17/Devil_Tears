"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

type OrderItem = {
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url?: string;
  };
};

type Order = {
  id: string;
  created_at: string;
  status: "в обработке" | "отправлен" | "доставлен" | "отменен";
  total_price: number;
  full_name: string;
  country: string;
  address: string;
  postal_code: string;
  phone: string;
  user_id?: string;
  order_number?: number;
  order_items: OrderItem[];
};

export const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items:order_items(
            quantity,
            price,
            product:product_id(name, image_url)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersWithNumbers = data.map((order: any, index: number) => ({
        ...order,
        order_number: data.length - index,
      }));

      setOrders(ordersWithNumbers as Order[]);
    } catch (err) {
      setError("Ошибка загрузки заказов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newChannel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...data } : order
        )
      );
    } catch (err) {
      setError("Ошибка обновления статуса");
      console.error(err);
      await fetchOrders();
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const searchNumber = parseInt(searchTerm.replace(/\D/g, ""), 10);
    return (
      !isNaN(searchNumber) &&
      order.order_number?.toString().includes(searchNumber.toString())
    );
  });

  if (loading) return <div className="p-6 text-xl">Загрузка заказов...</div>;
  if (error) return <div className="p-6 text-red-600 text-xl">{error}</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Управление заказами</h2>
        <div className="relative w-full sm:w-64">
          <div className="flex items-center">
            <span className="absolute left-3 text-gray-400">#</span>
            <input
              type="text"
              placeholder="Поиск по номеру заказа"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
              className="w-full pl-6 pr-10 py-2 border rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 
                           hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Товары
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Адрес
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-sm font-medium">
                      #{order.order_number}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(order.created_at)
                        .toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .replace(" г.", "")}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm">
                      <div className="flex flex-col gap-2 max-w-[100px] sm:max-w-[150px] md:max-w-none">
                        {order.order_items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {item.product.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-8 h-8 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="text-sm truncate max-w-full">
                                {item.product.name}
                              </div>
                              <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                {item.quantity} ×{" "}
                                {item.price.toLocaleString("ru-RU")} ₽
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm">
                      <div className="font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                        {order.full_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {order.country}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-4 py-3 text-sm">
                      {order.phone}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-4 py-3 text-sm">
                      <div className="truncate max-w-[120px] lg:max-w-none">
                        {order.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.postal_code}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
                      {order.total_price.toLocaleString("ru-RU")} ₽
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value as Order["status"]
                          )
                        }
                        className={`px-1 sm:px-3 py-1 text-xs sm:text-sm rounded-full border w-full max-w-[90px] ${
                          order.status === "доставлен"
                            ? "bg-green-100 border-green-600"
                            : order.status === "отправлен"
                            ? "bg-blue-100 border-blue-600"
                            : order.status === "отменен"
                            ? "bg-red-100 border-red-600"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      >
                        <option value="в обработке">В обработке</option>
                        <option value="отправлен">Отправлен</option>
                        <option value="доставлен">Доставлен</option>
                        <option value="отменен">Отменен</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!loading && (
        <>
          {orders.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Нет активных заказов
            </div>
          )}

          {orders.length > 0 && filteredOrders.length === 0 && searchTerm && (
            <div className="text-center py-6 text-gray-500">
              {isNaN(parseInt(searchTerm, 10))
                ? "Некорректный номер заказа"
                : "Заказ не найден"}
            </div>
          )}
        </>
      )}
    </div>
  );
};
