interface TagProps {
	tagName: string | undefined;
	color: string | undefined;
}

const Tag = ({ tagName, color }: TagProps) => {
	return (
		<div
			className={`flex w-fit justify-center py-[3px] px-[10px] rounded-full ${color} text-white font-light text-[12px]`}
		>
			{tagName}
		</div>
	);
};

export default Tag;