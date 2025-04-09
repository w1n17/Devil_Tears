"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  sizes: string[];
  category: string;
};

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    description: "",
    image_url: "",
    sizes: [],
    category: "",
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        setProducts(data as Product[]);
      } catch (err) {
        setError("Ошибка загрузки товаров");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      if (!file) throw new Error("Файл не выбран");

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!["png", "jpg", "jpeg", "webp"].includes(fileExt || "")) {
        throw new Error("Поддерживаются только PNG, JPG и WEBP");
      }

      const fileName = `${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) throw new Error("Ошибка получения URL");

      setNewProduct((prev) => ({
        ...prev,
        image_url: urlData.publicUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setNewProduct((prev) => ({ ...prev, image_url: "" }));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("products")
          .update({
            ...newProduct,
            price: Number(newProduct.price),
            sizes: newProduct.sizes,
          })
          .eq("id", editingId)
          .select();

        if (error) throw error;
        setProducts(
          products.map((p) => (p.id === editingId ? (data[0] as Product) : p))
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              ...newProduct,
              price: Number(newProduct.price),
              sizes: newProduct.sizes,
            },
          ])
          .select();

        if (error) throw error;
        setProducts([...products, data[0] as Product]);
      }

      setNewProduct({
        name: "",
        price: 0,
        description: "",
        image_url: "",
        sizes: [],
        category: "",
      });
      setEditingId(null);
    } catch (err) {
      setError(editingId ? "Ошибка обновления" : "Ошибка добавления");
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      image_url: product.image_url,
      sizes: product.sizes,
      category: product.category,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewProduct({
      name: "",
      price: 0,
      description: "",
      image_url: "",
      sizes: [],
      category: "",
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар навсегда?")) return;
    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      setError("Ошибка удаления");
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="relative group bg-gradient-to-tr from-[#544545] from-50% to-[#B84747] rounded-3xl w-64 h-96 m-4 transition-transform hover:scale-105">
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => startEditing(product)}
          className="p-2 bg-white/90 rounded-full hover:bg-blue-500 transition-colors"
        >
          ✏️
        </button>
        <button
          onClick={() => deleteProduct(product.id)}
          className="p-2 bg-white/90 rounded-full hover:bg-red-500 transition-colors"
        >
          🗑
        </button>
      </div>

      <div className="flex flex-col h-full p-4 justify-between">
        <div className="text-center">
          <div className="text-white text-2xl font-caveat mb-2">
            {product.category}
          </div>
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              width={256}
              height={256}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <h1 className="text-2xl text-white font-alegreya mb-2">
            {product.name}
          </h1>
        </div>
        <div className="text-xl text-white font-alegreya text-center">
          {product.price} ₽
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-caveat text-3xl">Загрузка каталога...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600 font-alegreya text-xl text-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-caveat text-center mb-6 md:mb-8">
          🛠 Управление товарами
        </h1>

        <div className="bg-[#f5f5f5] p-4 sm:p-6 rounded-3xl border-2 border-black mb-8 md:mb-12">
          <h2 className="font-caveat text-2xl sm:text-3xl mb-4 sm:mb-6">
            {editingId ? "✎ Редактирование товара" : "＋ Добавить новый товар"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <input
              type="text"
              placeholder="Название товара"
              className="p-3 sm:p-4 border-2 border-black rounded-3xl font-alegreya text-sm sm:text-base"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, name: e.target.value }))
              }
            />

            <input
              type="number"
              placeholder="Цена в рублях"
              className="p-3 sm:p-4 border-2 border-black rounded-3xl font-alegreya text-sm sm:text-base"
              value={newProduct.price || ""}
              onChange={(e) =>
                setNewProduct((p) => ({
                  ...p,
                  price: Number(e.target.value),
                }))
              }
            />

            <div className="md:col-span-2">
              <textarea
                placeholder="Описание товара"
                className="w-full p-3 sm:p-4 border-2 border-black rounded-3xl font-alegreya text-sm sm:text-base h-24 sm:h-32"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadImage(e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center gap-2 p-3 sm:p-4 border-2 border-black rounded-3xl font-alegreya bg-white hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  🖼️ {uploading ? "Загрузка..." : "Загрузить изображение"}
                </label>
              </div>

              {newProduct.image_url && (
                <div className="relative">
                  <img
                    src={newProduct.image_url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setNewProduct((p) => ({ ...p, image_url: "" }))
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Категория товара"
              className="p-3 sm:p-4 border-2 border-black rounded-3xl font-alegreya text-sm sm:text-base"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, category: e.target.value }))
              }
            />

            <div>
              <div className="text-base font-caveat mb-2">Размеры:</div>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const isSelected = newProduct.sizes.includes(size);
                      setNewProduct((p) => ({
                        ...p,
                        sizes: isSelected
                          ? p.sizes.filter((s) => s !== size)
                          : [...p.sizes, size],
                      }));
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      newProduct.sizes.includes(size)
                        ? "bg-gradient-to-br from-[#544545] to-[#B84747] text-white"
                        : "bg-white border-2 border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center gap-4 mt-4">
              {editingId && (
                <button
                  onClick={cancelEditing}
                  className="px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 rounded-full font-caveat text-lg sm:text-xl transition-colors"
                >
                  Отменить
                </button>
              )}
              <button
                onClick={handleSaveProduct}
                disabled={!newProduct.name || !newProduct.image_url}
                className={`px-6 py-2 sm:py-3 rounded-full font-caveat text-lg sm:text-xl transition-colors ${
                  !newProduct.name || !newProduct.image_url
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-br from-[#544545] to-[#B84747] text-white hover:opacity-90"
                }`}
              >
                {editingId ? "Сохранить изменения" : "Добавить товар"}
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-caveat mb-4 sm:mb-6">
          Каталог товаров
        </h3>

        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {products.length === 0 && (
            <div className="w-full text-center py-8 text-gray-500 font-alegreya">
              Пока нет товаров в каталоге
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
