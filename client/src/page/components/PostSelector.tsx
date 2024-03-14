import { PostFormType } from "../../types/post";
import { Select } from "@mantine/core";
import arrow_down from "../../public/icons/arrow-down.svg";
import { useEffect, useState } from "react";


type Role = "PRESIDENT" | "VICE_PRESIDENT" | "ADMIN" | "NORMAL";

type PostSelectorProps = {
	role: Role | null;
	value: PostFormType;
	onChange: (value: PostFormType) => void;
};

const getPostBadge = (postFormType: PostFormType) => {
	switch (postFormType) {
		case "normal_post":
			return "#28C3D7";
		case "news":
			return "#03A96B";
		case "qna":
			return "#F2914B";
		case "event":
			return "#F24B4B";
		default:
			return "";
	}
};


export default function PostSelector({ role, value, onChange }: PostSelectorProps) {
	const [options, setOptions] = useState([
		{ value: "normal_post", label: "โพสต์ทั่วไป" },
		{ value: "news", label: "ข่าวสาร" },
		{ value: "qna", label: "Q&A" },
		{ value: "event", label: "อีเว้นท์" },
	]);

    useEffect(() => {
        if (role === "ADMIN" || role === "PRESIDENT" || role === "VICE_PRESIDENT") {
            setOptions([
                { value: "normal_post", label: "โพสต์ทั่วไป" },
                { value: "news", label: "ข่าวสาร" },
                { value: "qna", label: "Q&A" },
                { value: "event", label: "อีเว้นท์" },
            ]);
        } else {
            setOptions([
                { value: "normal_post", label: "โพสต์ทั่วไป" },
                { value: "qna", label: "Q&A" },
            ]);
        }
    }, [role]);    

	return (
		<Select
			styles={{
				input: {
					backgroundColor: getPostBadge(value),
					color: "white",
					padding: "0 10px",
					fontSize: "14px",
					minHeight: "0",
					height: "24px",
					fontFamily: `'__Prompt_2d0d9b', '__Prompt_Fallback_2d0d9b'`,
				},
				dropdown: {
					borderRadius: "20px",
				},
			}}
			rightSection={<img src={arrow_down} alt="chevron-down" width={9} height={9} />}
			variant="filled"
			radius="xl"
			data={options}
			defaultValue="normal_post"
			allowDeselect={false}
			withCheckIcon={false}
			onChange={(value) => onChange(value as PostFormType)}
		/>
	);
}
