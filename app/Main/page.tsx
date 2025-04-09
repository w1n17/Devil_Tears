import { Image, Catalog, Photo, Footer } from "./components";
import Slider from "../../Shared/Slider/Slider";
import { InterfaceUI } from "../InterfaceUI";
import React from "react";

export default function page() {
  return (
    <div className="overflow-hidden">
      <main>
        <InterfaceUI>
          <div className="w-full">
            <Slider />
            <Image />
            <Slider />
          </div>
        </InterfaceUI>
        <Catalog />
        <Photo />
        <Footer />
      </main>
    </div>
  );
}
