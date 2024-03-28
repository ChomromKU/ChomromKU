import { PostFormType } from "../../types/post";
import { Select } from "@mantine/core";
import arrow_down from "../../images/arrow-down.svg";
import { useEffect, useState } from "react";
import { Role } from "../../types/club";
import { DynamicSelect } from "./DynamicSelect";

type PostSelectorProps = {
	role: Role | null;
	value: PostFormType;
	onChange: (value: PostFormType) => void;
};

const getPostBadge = (postFormType: OptionType | null) => {
    if (!postFormType) return 'bg-[#006664] w-[145px]'; // handle null case
    switch (postFormType.value) {
        case "normal_post":
            return "bg-[#28C3D7] w-[100px]";
        case "news":
            return "bg-[#03A96B] w-[75px]";
        case "qa":
            return "bg-[#F2914B] w-[60px]";
        case "event":
            return "bg-[#F24B4B] w-[70px]";
    }
};

interface OptionType {
	label: string;
	value: PostFormType;
}

export default function PostSelector({ role, value, onChange }: PostSelectorProps) {
	const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [options, setOptions] = useState<OptionType[]>([
        { value: "normal_post", label: "โพสต์ทั่วไป" },
        { value: "news", label: "ข่าวสาร" },
        { value: "qa", label: "Q&A" },
        { value: "event", label: "อีเว้นท์" },
    ]);
    const [selectedProduct, setSelectedProduct] = useState<OptionType | null>(null);

    useEffect(() => {
        if (role === "ADMIN" || role === "PRESIDENT" || role === "VICE_PRESIDENT") {
            setOptions([
                { value: "normal_post", label: "โพสต์ทั่วไป" },
                { value: "news", label: "ข่าวสาร" },
                { value: "qa", label: "Q&A" },
                { value: "event", label: "อีเว้นท์" },
            ]);
        } else {
            setOptions([
                { value: "normal_post", label: "โพสต์ทั่วไป" },
                { value: "qa", label: "Q&A" },
            ]);
        }
    }, [role]);    

	return (
		<DynamicSelect
			items={options}
			placeholder="เลือกประเภทโพสต์"
			className={`w-fit rounded-[20px] border-none ${getPostBadge(selectedProduct)} text-white px-[10px] py-[3px] focus-visible:outline-none text-center`}
			value={selectedProductId}
			labelExtractor={({ label }) => label}
			valueExtractor={({ value }) => value}
			onValueChange={(value, selectedValue) => {
				setSelectedProduct(selectedValue);
				setSelectedProductId(value);
				onChange(value as PostFormType)
			}}
		/>
	);
}
