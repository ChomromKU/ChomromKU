import { useEffect, useState } from "react";

type SearchProps = {
	type: "clubs" | "events";
	placeholder: string;
	onSearch: (query: string) => void;
};

export default function Search({ type, placeholder, onSearch }: SearchProps) {
	const [search, setSearch] = useState("");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		onSearch(value);
	};

	return (
		<div>
			<input type="text" value={search} placeholder={placeholder} className="w-full border border-1 py-[9px] px-[15px] rounded-[20px]" onChange={handleInputChange} />
		</div>
	);
}