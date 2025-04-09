"use client";

import { Image } from "../signup/components/Image";
import { Login } from "../signin/components/Login";

export default function Page() {
  return (
    <div className="flex flex-row justify-center items-center overflow-y-hidden gap-60">
      <Image />
      <Login />
    </div>
  );
}
