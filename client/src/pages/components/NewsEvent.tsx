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
import commentIcon from "../../images/chat.svg";
import { FiSend } from "react-icons/fi";
import { Club } from "../../types/club";
import eventImage from '../../images/event.png'

interface NewsEventProps {
	event: Events;
	role?: Role;
	clubLabel: string;
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

const NewsEvent: React.FC<NewsEventProps> = ({ event, role, clubLabel, reFetchPost }) => {
	const { user } = useAuth();
	const [openedAccept, { open: openAccept, close: closeAccept }] = useDisclosure(false);
    const [openedDecline, { open: openDecline, close: closeDecline }] = useDisclosure(false);
	const [sending, setSending] = useState<boolean>(false)
	const [successModalOpened, setSuccessModalOpened] = useState(false);
	const [postOwner, setPostOwner] = useState<User>();
	const initialLikeCount = event.likes ? event.likes.length : 0;
    const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
	const [isLike, setIsLike] = useState<boolean>(false);

	const openSuccessModal = () => {
		setSuccessModalOpened(true);
	};
	const closeSuccessModal = () => {
		setSuccessModalOpened(false);
	};

	const onDeletes = async (eventId: number) => {
		try {
            setSending(true)
            await axios.delete(`http://localhost:3001/events/${eventId}`);
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

	const approvedPost = async (eventId: number) => {
		try {
			console.log(eventId);
            setSending(true)
            await axios.put(`http://localhost:3001/events/${eventId}/approve`);
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
	
	const handleCopyLink = () => {
    const eventLink = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(eventLink)
      .then(() => {
        alert('คัดลอกลิงค์สู่คลิปบอร์ดแล้ว');
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        alert('คัดลอกลิงค์ล้มเหลว');
      });
	}
	
	useEffect(() => {
		const fetchIsLike = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
          if (response.status === 200) {
            setIsLike(event.likes.some((like) => like.userId === response.data.id));
          } else {
            setIsLike(false);
          }
        } catch (error) {
          setIsLike(false);
        }
      }
    };
    fetchIsLike();
  }, [user, event]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/users`);
				setPostOwner(data.find((user: User) => user.id === event.ownerId)) 
			} catch (e) {
				console.log(e);
			}
		}
		fetchUser()
		console.log(likeCount);
	},[event.ownerId])

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
		<div className="w-full p-[15px] rounded-[20px]" style={{ boxShadow: "0px 0px 20px 0px rgba(0, 0, 0, 0.10)"}}>
			<Link to={`/events/${event.id}`}>
			<header className="flex items-center gap-2 mb-[10px]">	
				<div className="rounded-full p-4 h-6 w-6 flex items-center justify-center bg-orange-400 color-white">{postOwner?.firstNameEn[0]}</div>
				<div className="w-full flex-1 flex flex-col">
					<Link to={`/clubs/${event.clubId}`}>
						<div className="flex justify-between items-center">
							<p className="h-1/2 font-normal">{clubLabel}</p>
						</div>
					</Link>
					<p className="h-1/2 text-xs font-light">{postOwner?.firstNameEn} {postOwner?.lastNameEn}</p>
				</div>
				<div className="">
					<Tag tagName="อีเว้นท์" color="bg-[#F24B4B]" />
				</div>
			</header>
			<p className="text-[24px] font-bold break-all mb-[10px]">{event.title}</p>
			<div className="mb-[10px] font-light">
				<span className="mr-2 break-all">{truncateText(event.content)}</span>
				<Link to={`/events/${event.id}`}>
					<span style={{ color: "#006664", textDecoration: "underline" }}>อ่านเพิ่มเติม</span>
				</Link>
			</div>
			<div className="w-full relative mb-2" style={{ display: "flex", justifyContent: "center" }}>
				{event.imageUrl && (
					<img
						src={event.imageUrl}
						width={0}
						height={0}
						sizes="100vw"
						style={{ width: "100%", height: "400px", borderRadius: '10px' }}
						alt={"event"}
					/>
				)}
			</div>
			</Link>
			{!canApprove(role) ? (
				<div>
					<div className="flex gap-1 mb-2">
						<LikeButton isLike={isLike} like={like} unlike={unlike} postId={event.id} type={"event"} />
						<Link to={`/events/${event.id}`} className="mt-[2px]">
							<img src={commentIcon} height={16} width={16} alt={"comment"} />
						</Link>
						<FiSend className="h-5 w-5 cursor-pointer" onClick={handleCopyLink} />
					</div>
					<div className="flex justify-between gap-2">
						<p className="h-1/2 font-light text-xs">{likeCount} likes</p>
						<p className="h-1/2 font-light text-xs">{getPreviousTime(event.createdAt)}</p>
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
					คุณตกลงอนุมัติโพสต์หัวข้อ <br/><span className="font-bold break-all">{event.title}</span>
					<p>โดย {postOwner?.titleTh} {postOwner?.firstNameTh} {postOwner?.lastNameTh} ใช่หรือไม่</p>
				</p>
				<div className="flex gap-2 items-center justify-center">
					<button
						onClick={() => approvedPost(event.id)}
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
						คุณปฏิเสธโพสต์หัวข้อ <br/><span className="font-bold break-all">{event.title}</span>
						<p>โดย {postOwner?.titleTh} {postOwner?.firstNameTh} {postOwner?.lastNameTh} ใช่หรือไม่</p>
						</p>
						<div className="flex gap-2 items-center justify-center">
							<button
								className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
								onClick={() => onDeletes(event.id)}
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

export default NewsEvent;
