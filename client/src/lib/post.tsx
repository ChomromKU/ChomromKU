import { PostType } from "../types/post";

export function getPostTypeEnumValue(type: string | PostType): PostType | undefined {
	switch (type) {
		case 'NORMAL_POST':
			return PostType.NORMAL_POST;
		case 'QA':
			return PostType.QA;
		case 'NEWS':
			return PostType.NEWS;
		case 'EVENT':
			return PostType.EVENT;
		default:
			return undefined; // Return undefined for unrecognized types
	}
}

export const postTypeToColorMap = (type: PostType | undefined) => {
	switch (type) {
		case PostType.NORMAL_POST:
			return "bg-[#28C3D7]";
		case PostType.NEWS:
			return "bg-[#03A96B]";
		case PostType.QA:
			return "bg-[#F2914B]";
		case PostType.EVENT:
			return "bg-[#F24B4B]";
	}
};

export const postTypeToLabelPost = (type: PostType | undefined) => {
    switch (type) {
        case PostType.NORMAL_POST:
            return "โพสต์ทั่วไป";
        case PostType.NEWS:
            return "news";
        case PostType.QA:
            return "Q&A";
		case PostType.EVENT:
			return "EVENT";
    }
};
