"use client";

type AdminNavProps = {
  activeTab: "orders" | "products";
  setActiveTab: (tab: "orders" | "products") => void;
};

export const AdminNav = ({ activeTab, setActiveTab }: AdminNavProps) => {
  return (
    <div className="flex gap-6 mb-8 border-b-2 border-[#544545] pb-6">
      <button
        onClick={() => setActiveTab("orders")}
        className={`px-8 py-3 rounded-3xl text-xl font-alegreya transition-all border-2
          ${
            activeTab === "orders"
              ? "bg-gradient-to-br from-[#544545] to-[#B84747] text-white border-transparent"
              : "border-black hover:bg-black hover:text-white"
          }`}
      >
        📦 Управление заказами
      </button>
      <button
        onClick={() => setActiveTab("products")}
        className={`px-8 py-3 rounded-3xl text-xl font-alegreya transition-all border-2
          ${
            activeTab === "products"
              ? "bg-gradient-to-br from-[#544545] to-[#B84747] text-white border-transparent"
              : "border-black hover:bg-black hover:text-white"
          }`}
      >
        🧥 Управление товарами
      </button>
    </div>
  );
};
