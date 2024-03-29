import { Link } from "react-router-dom";

type ClubBoxProps = {
	clubId: number;
	clubName: string;
};

export default function ClubBox({ clubId, clubName }: ClubBoxProps) {
	return (
		<Link
			to={`/clubs/${clubId}`}
			className="p-[15px] rounded-[20px]"
			style={{ boxShadow: "0px 0px 20px 0px rgba(0, 0, 0, 0.10)" }}
		>
			{clubName}
		</Link>
	);
}