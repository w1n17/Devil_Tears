"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setStatusMessage("Успешный вход! Перенаправляем...");

      setTimeout(() => {
        window.location.href = "/Main";
      }, 1500);
    } catch (error) {
      setStatusMessage(
        `Ошибка входа: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center gap-6 mt-16"
      >
        <div className="flex flex-col gap-12 justify-center items-center">
          <h1 className="text-4xl font-caveat">Вход</h1>

          {statusMessage && (
            <p
              className={`text-base font-alegreya ${
                statusMessage.includes("Ошибка")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {statusMessage}
            </p>
          )}

          <form
            onSubmit={handleSignIn}
            className="flex flex-col gap-8 w-full items-center"
          >
            <input
              type="email"
              placeholder="ПОЧТА"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-80 h-16 border-2 rounded-3xl border-black placeholder:text-black pl-7 font-alegreya"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="ПАРОЛЬ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-80 h-16 border-2 rounded-3xl border-black placeholder:text-black pl-7 font-alegreya pr-12"
                required
              />
              <img
                src={
                  showPassword
                    ? "/images/register/unlock_eye.png"
                    : "/images/register/lock_eye.png"
                }
                alt="Показать пароль"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            </div>

            <button
              type="submit"
              className="border-2 rounded-3xl border-black w-36 h-12 font-alegreya
                hover:bg-black hover:text-white transition-colors duration-300"
            >
              Войти
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/reset-password"
            className="font-alegreya text-sky-500 underline hover:text-sky-600"
          >
            Я забыл пароль
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/signup"
              className="flex items-center gap-1 group transition-all"
            >
              <span className="font-alegreya underline group-hover:text-black/80">
                Регистрация
              </span>
              <img
                src="/images/photo/Arrow_right.png"
                alt="Стрелка"
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
