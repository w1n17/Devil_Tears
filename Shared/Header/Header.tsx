"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./components";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RealtimeChannel, Subscription } from "@supabase/supabase-js";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const router = useRouter();

  const loadFavorites = async (userId: string) => {
    if (!userId) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favourites")
        .select(
          `
          *,
          products:product_id (
            id,
            name,
            price,
            image_url
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading favorites:", error);
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  useEffect(() => {
    let authSubscription: Subscription;
    let favouritesChannel: RealtimeChannel;

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setFavorites([]);
        return;
      }

      const { data: isAdminData } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(isAdminData?.is_admin ?? false);
      setUser({ ...user, is_admin: isAdminData?.is_admin });

      loadFavorites(user.id);

      favouritesChannel = supabase
        .channel("favourites_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "favourites",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Realtime update received:", payload);
            loadFavorites(user.id);
          }
        )
        .subscribe();
    };

    checkAuth();

    authSubscription = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setFavorites([]);
        favouritesChannel?.unsubscribe();
      }
      checkAuth();
    }).data.subscription;

    return () => {
      authSubscription?.unsubscribe();
      favouritesChannel?.unsubscribe();
    };
  }, []);

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    try {
      // First check if the item is already in the cart
      const { data: existingCartItem, error: existingError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (existingCartItem) {
        alert("Этот товар уже есть в корзине");
        return;
      }

      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartError || !cart) {
        const { data: newCart, error: newCartError } = await supabase
          .from("carts")
          .insert([{ user_id: user.id }])
          .select("id")
          .single();

        if (newCartError) throw newCartError;
        cart = newCart;
      }

      // Add item to cart
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        size: "M",
        quantity: 1,
      });

      if (insertError) throw insertError;
      alert("Товар успешно добавлен в корзину");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert("Ошибка добавления в корзину: " + error.message);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favourites")
        .delete()
        .eq("id", favoriteId);

      if (error) {
        console.error("Error removing favorite:", error);
        throw error;
      }

      setFavorites((prev) => prev.filter((item) => item.id !== favoriteId));
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      alert("Ошибка удаления из избранного: " + error.message);
    }
  };
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(user ? "/Profile" : "/auth/signin");
  };

  const menuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className="fixed top-0 left-0 w-full flex flex-row items-center h-12 bg-[#BFBFBF] z-50 px-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="px-4 sm:px-10"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Button image="/images/header/Heart.png" />
      </motion.div>

      <Link href="/Main" className="flex-1 flex justify-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-[#544545] to-[#B84747] font-jaro"
        >
          Devil Tears
        </motion.h1>
      </Link>

      <div className="flex flex-row items-center gap-3 sm:gap-5 px-4 sm:px-10">
        {isAdmin && (
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link href="/admin">
              <Button image="/images/header/admin.png" />
            </Link>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.1 }}>
          <Link href="/Cart">
            <Button image="/images/header/bag.png" />
          </Link>
        </motion.div>

        <a
          href={user ? "/profile" : "/auth/signin"}
          onClick={handleProfileClick}
        >
          {user ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={user.user_metadata.avatar_url || "/images/header/User.png"}
              className="w-8 h-8 object-cover border-[#544545]"
              alt="Profile"
            />
          ) : (
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button image="/images/header/User.png" />
            </motion.div>
          )}
        </a>
      </div>

      <AnimatePresence>
        {!menuOpen && (
          <motion.div
            key="favorites-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full sm:w-72 h-96 bg-[#BFBFBF] absolute z-10 flex flex-col top-0 left-0 shadow-xl"
          >
            <div className="flex justify-end items-center mt-1 mr-1">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl text-black hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(true);
                }}
              >
                ×
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <AnimatePresence mode="sync">
                {favorites.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-black pt-4"
                  >
                    Нет избранных товаров
                  </motion.p>
                ) : (
                  favorites.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 bg-white p-1.5 mb-1 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <motion.img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-10 h-10 object-cover rounded"
                        whileHover={{ scale: 1.05 }}
                      />
                      <div className="flex gap-1.5 ml-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(item.products.id)}
                          className="text-black hover:text-green-600 px-2 py-1 text-sm bg-gray-100 rounded-md"
                        >
                          Купить
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="text-black hover:text-red-600 px-2 py-1 text-sm bg-gray-100 rounded-md"
                        >
                          Удалить
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
