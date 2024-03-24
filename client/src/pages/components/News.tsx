import dayjs from "dayjs";
// import Image from "next/image";
import React, { useEffect, useState } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import { Link } from "react-router-dom";
import Tag from "./Tag";
import LikeButton from "./LikeButton";
// import { ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { postTypeToColorMap, postTypeToLabelPost } from "../../lib/post";
import { useDisclosure } from "@mantine/hooks";
import eventImage from '../../images/event.png'
import commentIcon from '../../images/chat.svg'
import sendIcon from '../../images/send.svg'
import { Like, Post } from "../../types/post";
import { SocialMedia } from "../../types/club";
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import Modal from "./CustomModal";


import { PostType } from "../../types/post";
interface NewsProps {
	post: Post;
	role?: String;
}

const canApprove = (role?: string) => {
	if (!role) {
		return false;
	}
	return role === 'PRESIDENT' || role === 'VICE_PRESIDENT';
};

dayjs.extend(relativeTime);
dayjs.locale("th");

const News: React.FC<NewsProps> = ({ post, role }) => {
	const { user, logout } = useAuth();
	user? console.log(user.stdId): console.log('no user')
	const navigate = useNavigate();

	const [likeCount, setLikeCount] = useState<number>(post.likes.length);
	const [isLike, setIsLike] = useState<boolean>(false);

	const [opened, { open, close }] = useDisclosure(false);
	const [canApprove, setCanApprove] = useState<boolean>(false);

	const approveByPostId = async (postId: number, type: PostType, clubId: number) => {
		try {
			await axios.post(`http://localhost:3001/posts/${postId}/approve?type=${type}`, { clubId });
			// router.push(`/clubs/${post.clubId}`);
			navigate(`/clubs/${clubId}`);
			// console.log(res);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		if (user) {
			setIsLike(post.likes.some((like) => like.userId === user.id));
		} else {
			setIsLike(false);
		}
	}, [user, post]);

	const like = () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev + 1);
	};
	const unlike = () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev - 1);
	};

	const truncateText = (text: string) => (text.length >= 50 ? text.substring(0, 49) + "..." : text);
	const getPreviousTime = (date: Date) => dayjs(date).fromNow();

	return (
		<div className="w-full p-[15px] rounded-[20px]" style={{ boxShadow: "0px 0px 20px 0px rgba(0, 0, 0, 0.10)" }}>
 			<header className="flex items-start gap-[10px] mb-[10px]">
				<div className="rounded-full p-4 h-[35px] w-[35px] flex items-center justify-center bg-orange-400 color-white">A</div>
				<div className="w-full flex-1 flex flex-col">
					<Link to={`/clubs/${post.clubId}`}>
						<div className="flex justify-between items-center">
						    <p className="h-1/2 leading-[20px] font-normal">{post.club.label}</p>
						</div>
					</Link>
					<p className="h-1/2 text-xs font-light">owner first name</p>
				</div>
				<div className="">
					<Tag tagName={postTypeToLabelPost(post.type)}
                    color={postTypeToColorMap(post.type)} 
                    />
				</div>
			</header>
			<h1 className="text-[24px] font-bold">post title</h1>
 			<div className="mb-[10px] font-light">
			 <span className="mr-2 break-all">{truncateText(post.content)}</span>
				<Link to={`/posts/${post.id}`}>
					<span style={{ color: "#006664", textDecoration: "underline" }}>อ่านเพิ่มเติม</span>
				</Link>
			</div>
			<div className="w-full relative mb-[15px]">
				<img
					src={eventImage}
					// src={post.imageUrl || "/event.png"}
					width={0}
					height={0}
					sizes="100vw"
					style={{ width: "100%", height: "auto", borderRadius: '10px' }}
					alt={"event"}
				/>
			</div>
			{!canApprove ? (
				<div>
					<div className="flex gap-[10px] mb-[10px]">
					<LikeButton isLike={isLike} like={like} unlike={unlike} postId={0} type={"post"} />
						<img src={commentIcon} height={16} width={16} alt={"comment"} />
						<img src={sendIcon} height={16} width={16} alt={"share"} />
					</div>
					<div className="flex justify-between gap-2">
						<p className="h-1/2 font-light text-xs">{likeCount} likes</p>
						{/* <p className="h-1/2 font-light text-xs">{getPreviousTime(post.createdAt)}</p> */}
					</div>
				</div>
			) : (
				<div className="flex flex-row">
					<button className="block text-sm text-white py-1 px-4 border mr-1 bg-[#006664] rounded-full" onClick={open}>
						อนุมัติ
					</button>
					<button className="block text-sm text-[#F24B4B] py-1 px-4 border border-[#F24B4B] rounded-full">
						ปฏิเสธ
					</button>
				</div>
			)}
			<Modal centered opened={opened} onClose={close} withCloseButton={false}>
				<p className="font-light mb-2">
					คุณตกลงอนุมัติโพสต์หัวข้อ <span className="font-bold">{post.title}</span>
					<p>โดย {post.owner.titleTh + post.owner.firstNameTh + " " + post.owner.lastNameTh} ใช่หรือไม่</p>
				</p>
				<div className="flex gap-2 pt-2 items-center justify-center">
					<button
						onClick={() => {
							approveByPostId(post.id, post.type, post.clubId);
						}}
						className="py-1 px-4 rounded-full bg-[#006664] text-white"
					>
						ตกลง
					</button>
					<button
						type="submit"
						onClick={close}
						className="py-1 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
					>
						ยกเลิก
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default News;