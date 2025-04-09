import { Image, Catalog, Photo, Footer } from "./components";
import Slider from "../../Shared/Slider/Slider";
import { InterfaceUI } from "../InterfaceUI";
import React from "react";

export default function page() {
  return (
    <div className="overflow-x-hidden">
      <main>
        <InterfaceUI>
          <Slider />
          <Image />
          <Slider />
        </InterfaceUI>
        <Catalog />
        <Photo />
        <Footer />
      </main>
    </div>
  );
}
