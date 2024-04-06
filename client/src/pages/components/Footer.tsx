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
				<a href="https://github.com/ChomromKU">
					<img alt="github" src={github} width="17" height="17" />
				</a>
			</div>
			<Link to="https://forms.gle/tZTJzN1o3HpzDFMn8" className="text-xs underline">
				รายงานปัญหา
			</Link>
		</footer>
	);
}
