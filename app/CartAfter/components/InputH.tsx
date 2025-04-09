import React from "react";

interface InputHProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

export const InputH = ({ title, value, onChange, maxLength }: InputHProps) => {
  return (
    <div className="w-full mb-2">
      <h1 className="text-gray-400 text-sm font-normal mb-0.5 text-left">
        {title}
      </h1>
      <input
        type="text"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full h-8 outline-none border-b border-black focus:border-b-2 transition-all bg-transparent pb-0 font-medium"
      />
    </div>
  );
};
