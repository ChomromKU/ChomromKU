// import { PostType } from "@prisma/client";

export const postTypeToColorMap = (type: string) => {
	switch (type) {
		case 'NORMAL_POST':
			return "bg-[#28C3D7]";
		case 'NEWS':
			return "bg-[#03A96B]";
		case 'QA':
			return "bg-[#F2914B]";
	}
};

export const postTypeToLabelPost = (type: string) => {
	switch (type) {
		case 'NORMAL_POST':
			return "โพสต์ทั่วไป";
		case 'NEWS':
			return "news";
		case 'QA':
			return "Q&A";
	}
};