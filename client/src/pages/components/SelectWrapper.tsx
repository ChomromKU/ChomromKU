"use client";
import { NativeSelect } from "@mantine/core";
import React from "react";

interface SelectWrapperProps {
    value: string,
    setValue: (value: string) => void
}

const SelectWrapper: React.FC<SelectWrapperProps> = ({value, setValue}) => {
	return (
		<NativeSelect
            rightSection={<img src={"/chevron-down.svg"} height={16} width={16} alt={""}/>}
			value={value}
			onChange={(event) => setValue(event.currentTarget.value)}
			data={["บางเขน", "กำแพงแสน", "ศรีราชา"]}
            styles={{
                wrapper: {
                },
                input: {
                    borderRadius: '9999px',
                    paddingRight: '5px',
                    backgroundColor: '#03A96B',
                    color: 'white',
                    border: '0'
                }
            }}
		/>
	);
};

export default SelectWrapper;
