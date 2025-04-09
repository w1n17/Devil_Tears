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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-caveat text-center mb-12">
          🛠 Управление товарами
        </h1>

        <div className="bg-[#f5f5f5] p-6 rounded-3xl border-2 border-black mb-12">
          <h2 className="font-caveat text-3xl mb-6">
            {editingId ? "✎ Редактирование товара" : "＋ Добавить новый товар"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Название товара"
              className="p-4 border-2 border-black rounded-3xl font-alegreya"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, name: e.target.value }))
              }
            />

            <input
              type="number"
              placeholder="Цена"
              className="p-4 border-2 border-black rounded-3xl font-alegreya"
              value={newProduct.price || ""}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, price: +e.target.value }))
              }
            />

            <div className="space-y-2">
              <label className="font-alegreya">Изображение:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && uploadImage(e.target.files[0])
                }
                className="p-4 border-2 border-black rounded-3xl w-full"
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500">Загрузка изображения...</p>
              )}
            </div>

            <input
              type="text"
              placeholder="Категория"
              className="p-4 border-2 border-black rounded-3xl font-alegreya"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, category: e.target.value }))
              }
            />

            <div className="space-y-2">
              <label className="font-alegreya">Размеры (через запятую):</label>
              <input
                type="text"
                placeholder="S, M, L, XL"
                className="p-4 border-2 border-black rounded-3xl w-full"
                value={newProduct.sizes.join(", ")}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    sizes: e.target.value.split(",").map((s) => s.trim()),
                  }))
                }
              />
            </div>

            <textarea
              placeholder="Описание товара"
              className="p-4 border-2 border-black rounded-3xl h-32 font-alegreya"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, description: e.target.value }))
              }
            />

            <div className="flex gap-4 items-center">
              <button
                onClick={handleSaveProduct}
                disabled={uploading}
                className={`px-6 py-3 border-2 rounded-3xl font-alegreya transition-all
                  ${
                    editingId
                      ? "bg-green-100 border-green-600 hover:bg-green-600 hover:text-white"
                      : "bg-white border-black hover:bg-black hover:text-white"
                  }`}
              >
                {uploading
                  ? "Загрузка..."
                  : editingId
                  ? "Сохранить"
                  : "Добавить"}
              </button>

              {editingId && (
                <button
                  onClick={cancelEditing}
                  className="px-6 py-3 border-2 border-red-600 rounded-3xl
                           bg-red-100 hover:bg-red-600 hover:text-white"
                >
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
