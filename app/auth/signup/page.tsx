"use client";

import { Image } from "../signin/components/Image";
import { Register } from "../signup/components/Register";

export default function Page() {
  return (
    <div className="flex flex-row justify-center items-center overflow-y-hidden gap-60">
      <Image />
      <Register />
    </div>
  );
}
