import { Link } from "react-router-dom";
import github from "../../images/github.svg";
import line from "../../images/line.svg";
import facebook from "../../images/facebook.svg";
import instagram from "../../images/instagram.svg";

export default function Footer() {
	return (
		<footer className="bg-[#B2BB1E] w-full flex flex-col items-center justify-center text-sm text-white h-24">
			<p>ติดต่อเรา</p>
			<div className="flex my-1.5 gap-x-2.5">
				<img alt="github" src={github} width="17" height="17" />
				<img alt="line" src={line} width="20" height="20" />
				<img alt="facebook" src={facebook} width="16" height="16" />
				<img alt="instagram" src={instagram} width="16" height="16" />
			</div>
			<Link to="https://forms.gle/tZTJzN1o3HpzDFMn8" className="text-xs underline">
				รายงานปัญหา
			</Link>
		</footer>
	);
}
