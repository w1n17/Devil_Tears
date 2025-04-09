"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatusMessage("Пароли не совпадают!");
      return;
    }

    if (password.length < 6) {
      setStatusMessage("Пароль должен быть не менее 6 символов");
      return;
    }

    try {
      setStatusMessage("Регистрация...");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/signin` },
      });

      if (error) throw error;

      setStatusMessage("✅ Проверьте почту для подтверждения");
      setTimeout(() => router.push("/auth/signin"), 2000);
    } catch (error) {
      setStatusMessage(
        `❌ Ошибка: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col justify-center items-center gap-6 mt-16"
    >
      <h1 className="text-4xl font-caveat">Регистрация</h1>

      <form
        onSubmit={handleSubmit}
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <img
              src={
                showPassword
                  ? "/images/register/unlock_eye.png"
                  : "/images/register/lock_eye.png"
              }
              alt="Показать пароль"
              className="w-5 h-5 cursor-pointer"
            />
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="ПОДТВЕРДИТЬ ПАРОЛЬ"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-80 h-16 border-2 rounded-3xl border-black placeholder:text-black pl-7 font-alegreya pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <img
              src={
                showConfirmPassword
                  ? "/images/register/unlock_eye.png"
                  : "/images/register/lock_eye.png"
              }
              alt="Показать пароль"
              className="w-5 h-5 cursor-pointer"
            />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`text-center ${
              statusMessage.includes("❌") ? "text-red-500" : "text-green-500"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          className="border-2 rounded-3xl border-black w-40 h-12 font-alegreya hover:bg-black hover:text-white transition-colors"
        >
          Зарегистрироваться
        </button>
      </form>

      <Link href="/auth/signin" className="font-alegreya underline">
        Уже есть аккаунт
      </Link>
    </motion.div>
  );
};
