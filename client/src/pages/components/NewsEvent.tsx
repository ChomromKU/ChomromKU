"use client";

import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import { Role } from "../../types/club";
import { Post,PostType,Events } from "../../types/post";
import { User } from "../../types/auth";
import { useAuth } from '../../hooks/useAuth';
import Tag from "./Tag";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";
// import { ChatBubbleOvalLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { postTypeToColorMap, postTypeToLabelPost } from "../../lib/post";
import { useDisclosure } from "@mantine/hooks";
import Modal from "./CustomModal";
import { useNavigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa6";
import { FiSend } from "react-icons/fi";

interface NewsEventProps {
	event: Events;
	role?: Role;
}

const canApprove = (role?: string) => {
	if (!role) {
		return false;
	}
	return role === 'PRESIDENT' || role === 'VICE_PRESIDENT';
};


dayjs.extend(relativeTime);
dayjs.locale("th");

const NewsEvent: React.FC<NewsEventProps> = ({ event, role }) => {
	const { user, logout } = useAuth();
    const navigate = useNavigate();
    console.log(event)

	const [likeCount, setLikeCount] = useState<number>(event.likes.length);
	const [isLike, setIsLike] = useState<boolean>(false);
	const [opened, { open, close }] = useDisclosure(false);

	const approveByPostId = async (eventId: number, clubId: number) => {
		try {
			await axios.post(`/api/posts/${eventId}/approve?type=event`, { clubId });
			navigate(`/clubs/${clubId}`);
			// console.log(res);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		if (user) {
			setIsLike(event.likes.some((like) => like.userId === user.id));
		} else {
			setIsLike(false);
		}
	}, [user, event]);

	const like = async () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev + 1);
	};
	const unlike = async () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev - 1);
	};

	const truncateText = (text: string) => (text.length >= 100 ? text.substring(0, 99) + "..." : text);
	const getPreviousTime = (date: Date) => dayjs(date).fromNow();

	return (
		<div className="w-full p-4 border rounded-md shadow-sm">
			<header className="flex items-center gap-2 mb-4">
				<div className="rounded-full p-4 h-6 w-6 flex items-center justify-center bg-orange-400 color-white">A</div>
				<div className="w-full flex-1 flex flex-col">
					<Link to={`/clubs/${event.club.id}`}>
						<div className="flex justify-between items-center">
							<p className="h-1/2 font-normal">{event.club.label}</p>
						</div>
					</Link>
					<p className="h-1/2 text-xs font-light">{event.owner.firstNameTh}</p>
				</div>
				<div className="">
					<Tag tagName="อีเว้นท์" color="bg-[#F24B4B]" />
				</div>
			</header>
			<div className="mb-2">
				<span className="mr-2 break-all">{truncateText(event.content)}</span>
				<Link to={`/posts/${event.id}`}>
					<span style={{ color: "#006664", textDecoration: "underline" }}>อ่านเพิ่มเติม</span>
				</Link>
			</div>
			<div className="w-full relative mb-2">
				<img
					src={event.imageUrl || "/event.png"}
					width={0}
					height={0}
					sizes="100vw"
					style={{ width: "100%", height: "auto" }}
					alt={"event"}
				/>
			</div>
			{!canApprove(role) ? (
				<div>
					<div className="flex gap-1 mb-2">
						<LikeButton isLike={isLike} like={like} unlike={unlike} postId={0} type={"post"} />
						<FaRegComment className="h-5 w-5" />
						<FiSend className="h-5 w-5" />
					</div>
					<div className="flex justify-between gap-2">
						<p className="h-1/2 font-light text-xs">{likeCount} likes</p>
						<p className="h-1/2 font-light text-xs">{getPreviousTime(event.createdAt)}</p>
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
					คุณตกลงอนุมัติโพสต์หัวข้อ <span className="font-bold">{event.title}</span>
					<p>
						โดย {event.owner.titleTh + event.owner.firstNameTh + " " + event.owner.lastNameTh} ใช่หรือไม่
					</p>
				</p>
				<div className="flex gap-2 pt-2 items-center justify-center">
					<button
						onClick={() => {
							approveByPostId(event.id, event.clubId);
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

export default NewsEvent;
