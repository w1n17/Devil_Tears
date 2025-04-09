import React from "react";

interface InputHProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

export const InputH = ({ title, value, onChange, maxLength }: InputHProps) => {
  return (
    <div className="w-full">
      <h1 className="text-lg text-gray-600 font-alegreya mb-1 text-left">
        {title}
      </h1>
      <input
        type="text"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full h-8 outline-none border-b-2 border-gray-400 focus:border-black transition-colors"
      />
    </div>
  );
};
