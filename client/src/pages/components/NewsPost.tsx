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
import { postTypeToColorMap, postTypeToLabelPost, getPostTypeEnumValue } from "../../lib/post";
import { useDisclosure } from "@mantine/hooks";
import eventImage from '../../images/event.png'
import commentIcon from '../../images/chat.svg'
import sendIcon from '../../images/send.svg'
import { Like, Post } from "../../types/post";
import { SocialMedia } from "../../types/club";
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import Modal from "./CustomModal";
import { User } from "../../types/auth";

import { PostType } from "../../types/post";

interface NewsProps {
	post: Post;
	role?: string;
	reFetchPost?: () => Promise<void>;
}

const canApprove = (role?: string) => {
	if (!role) { 
		return false;
	}
	return role === 'PRESIDENT' || role === 'VICE_PRESIDENT' || role === 'ADMIN';
};

dayjs.extend(relativeTime);
dayjs.locale("th");

const News: React.FC<NewsProps> = ({ post, role, reFetchPost }) => {
	const { user } = useAuth();

	const [openedAccept, { open: openAccept, close: closeAccept }] = useDisclosure(false);
    const [openedDecline, { open: openDecline, close: closeDecline }] = useDisclosure(false);
	const [sending, setSending] = useState<boolean>(false)
	const [successModalOpened, setSuccessModalOpened] = useState(false);

	const [likeCount, setLikeCount] = useState<number>(post.likes.length);
	const [isLike, setIsLike] = useState<boolean>(false);
	const [postOwner, setPostOwner] = useState<User>();

	const openSuccessModal = () => {
		setSuccessModalOpened(true);
	};
	const closeSuccessModal = () => {
		setSuccessModalOpened(false);
	};

    const onDeletes = async (postId: number) => {
		try {
            setSending(true)
            await axios.delete(`http://localhost:3001/posts/${postId}`);
            closeDecline()
            openSuccessModal();
            setTimeout(() => {
                setSending(false)
				closeSuccessModal()
				reFetchPost?.()
            }, 3000);
		} catch (error) {
		console.error(error);
		}
	};

	const approvedPost = async (postId: number) => {
		try {
            setSending(true)
            await axios.put(`http://localhost:3001/posts/${postId}/approve`);
            closeAccept()
            openSuccessModal();
            setTimeout(() => {
                setSending(false)
				closeSuccessModal()
				reFetchPost?.()
            }, 3000);
		} catch (error) {
		console.error(error);
		}
	};

	useEffect(() => {
		if (user) {
			setIsLike(post.likes.some((like) => like.userId === user.id));
		} else {
			setIsLike(false);
		}
	}, [user, post]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/users`);
				setPostOwner(data.find((user: User) => user.id === post.ownerId))
			} catch (e) {
				console.log(e);
			}
		}
		fetchUser()
	},[post.ownerId])

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

	// console.log(post);
	

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
					<p className="h-1/2 text-xs font-light">{postOwner?.firstNameEn} {postOwner?.lastNameEn}</p>
				</div>
				<div className="">
					<Tag tagName={postTypeToLabelPost(getPostTypeEnumValue(post.type as unknown as string))}
                    color={postTypeToColorMap(getPostTypeEnumValue(post.type as unknown as string))} 
                    />
				</div>
			</header>
			<h1 className="text-[24px] font-bold">{post.title}</h1>
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
			{!canApprove(role) ? (
				<div>
					<div className="flex gap-[10px] mb-[10px]">
					<LikeButton isLike={isLike} like={like} unlike={unlike} postId={0} type={"post"} />
						<img src={commentIcon} height={16} width={16} alt={"comment"} />
						<img src={sendIcon} height={16} width={16} alt={"share"} />
					</div>
					<div className="flex justify-between gap-2">
						<p className="h-1/2 font-light text-xs">{likeCount} likes</p>
						<p className="h-1/2 font-light text-xs">{getPreviousTime(post.createdAt)}</p>
					</div>
				</div>
			) : (
				<div className="flex flex-row">
					<button 
						className="block text-sm text-white py-1 px-4 border mr-1 bg-[#006664] rounded-full" 
						onClick={openAccept}
					>
						อนุมัติ
					</button>
					<button 
						className="block text-sm text-[#F24B4B] py-1 px-4 border border-[#F24B4B] rounded-full"
						onClick={openDecline}
					>
						ปฏิเสธ
					</button>
				</div>
			)}
			<Modal centered opened={openedAccept} onClose={closeAccept} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${openedAccept && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
				<p className="font-light mb-[15px] leading-[25px]">
					คุณตกลงอนุมัติโพสต์หัวข้อ <br/><span className="font-bold">{post.title}</span>
					<p>โดย {postOwner?.titleTh} {postOwner?.firstNameTh} {postOwner?.lastNameTh} ใช่หรือไม่</p>
				</p>
				<div className="flex gap-2 items-center justify-center">
					<button
						onClick={() => approvedPost(post.id)}
						className="py-1 px-4 rounded-full bg-[#006664] text-white"
					>
						ตกลง
					</button>
					<button
						type="submit"
						onClick={closeAccept}
						className="py-1 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
					>
						ยกเลิก
					</button>
				</div>
			</Modal>
			<Modal centered opened={openedDecline} onClose={closeDecline} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${openedDecline && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
				{ sending ? <p>กำลังลบข้อมูล</p>:
					<>
						<p className="font-light mb-[15px] leading-[25px]">
						คุณปฏิเสธโพสต์หัวข้อ <br/><span className="font-bold">{post.title}</span>
						<p>โดย {postOwner?.titleTh} {postOwner?.firstNameTh} {postOwner?.lastNameTh} ใช่หรือไม่</p>
						</p>
						<div className="flex gap-2 items-center justify-center">
							<button
								className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
								onClick={() => onDeletes(post.id)}
							>
								ตกลง
							</button>
							<button
								onClick={closeDecline}
								className="py-2 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
							>
								ยกเลิก
							</button>
						</div>
					</>
				}
			</Modal>
			<Modal
				centered
				opened={successModalOpened}
				onClose={closeSuccessModal}
				withCloseButton={false}
				className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${successModalOpened && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}
			>
				<p>สำเร็จ</p>
			</Modal>
		</div>
	);
};

export default News;