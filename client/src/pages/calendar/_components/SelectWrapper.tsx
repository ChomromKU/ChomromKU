import React from "react";
import down from "../../../images/chevron-down.svg";

interface SelectWrapperProps {
  value: string;
  setValue: (value: string) => void;
}

const SelectWrapper: React.FC<SelectWrapperProps> = ({ value, setValue }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="bg-[#03A96B] text-white py-2 pr-6 rounded-full border-0"
      >
        <option value="บางเขน">บางเขน</option>
        <option value="กำแพงแสน">กำแพงแสน</option>
        <option value="ศรีราชา">ศรีราชา</option>
      </select>
      <img
        src={down}
        height={16}
        width={16}
        alt=""
        className="absolute top-0 right-0 mt-3 mr-2 pointer-events-none"
      />
    </div>
  );
};

export default SelectWrapper;
