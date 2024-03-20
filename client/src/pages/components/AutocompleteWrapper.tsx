import React from "react";
import { Autocomplete, ComboboxItem } from "@mantine/core";
import searchIcon from "../../images/search.svg";
import { useNavigate } from "react-router-dom";

interface AutocompleteWrapperProps {
  data: ComboboxItem[];
}

const AutocompleteWrapper: React.FC<AutocompleteWrapperProps> = ({ data }) => {
//   const navigate = useNavigate();

//   const handleOptionSubmit = (value: string) => {
//     navigate(`/clubs/${value}`);
//   };

  return (
    <div className="w-full rounded-full flex items-center border-2 py-[8px] px-[13px]">
      <img src={searchIcon} alt="" width={16} height={16} className="mr-2" />
      <div className="flex-1">
        <Autocomplete
          placeholder="ค้นหาชมรมและคอมมิวนิตี้ของคุณ"
          data={data}
          // // onOptionSubmit={handleOptionSubmit}
          styles={{
            input: {
              width: '100%',
            },
          }}
        />
      </div>
      
    </div>
  );
};

export default AutocompleteWrapper;
