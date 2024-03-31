import { useEffect, useState } from "react";
import Tag from "../../components/Tag";
import { FiSend } from "react-icons/fi";
import CommentInput from "../../components/CommentInput";
import { Events } from "../../../types/post";
import FollowEventButton from "./FollowEventButton";
import LikeButton from "../../components/LikeButton";
import { useAuth } from "../../../hooks/useAuth";
import { useParams } from "react-router-dom";
import axios from "axios";

type EventDetailProps = {
	event: Events;
};

const EventDetail = ({ event }: EventDetailProps) => {
	const { user } = useAuth();
	const { id } = useParams< {id?: string}>();
	const [userId, setUserId] = useState<number>(0);
	const [likeCount, setLikeCount] = useState<number>(
		event?.likes?.length !== undefined ? event.likes.length : 0
	);	
	const [isLike, setIsLike] = useState<boolean>(
		user && event && event.likes ? event.likes.some((like) => like.userId === user.id) : false
	);
	
	useEffect(() => {
		const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
        if (response.status === 200) {
          const fetchedUserId = response.data.id;
          setUserId(fetchedUserId); 
        } else {
          console.error('Failed to fetch user id');
        }
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };
    if (user?.stdId) {
      fetchUserId();
    }
		if (user && event && event.likes) {
			setIsLike(event.likes.some((like) => like.userId === userId));
		} else {
			setIsLike(false);
		}
	}, [id, user?.stdId, userId, user, event]);

	const like = () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev + 1);
	};
	const unlike = async () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev - 1);
	};

	return (
		<div className="w-full p-8 flex flex-col gap-3">
			<header>
				<div className="flex justify-between font-light text-sm mb-2">
					<span>
						โดย {event.owner?.firstNameTh} {event.owner?.lastNameTh}
					</span>
					<span>
						{event.createdAt instanceof Date ? event.createdAt.toLocaleDateString("th-TH", {
							year: "numeric",
							month: "long",
							day: "numeric",
						}) : 'ไม่ระบุเวลาที่โพส'}
					</span>
				</div>
				<div className="flex flex-col gap-2">
				<span className="text-2xl font-bold">{event.title}</span>
				<span className="text-xl font-bold">วันเริ่มต้นและสิ้นสุด: {Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
					new Date(event.startDate),)} - {Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
					new Date(event.endDate),)}
				</span>
				<span className="text-xl font-bold">สถานที่จัดกิจกรรม: {event.location}</span>
				<span className="text-xl font-bold">ณ เวลา {event.startTime} - {event.endTime}</span>
				</div>
			</header>
			<section className="flex flex-col gap-4">
				<Tag tagName={"อีเว้นท์"} color={"bg-[#F24B4B]"} />
				<p className="font-light break-all">{event.content}</p>
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<LikeButton isLike={isLike} like={like} unlike={unlike} postId={event.id} type="event" />
						<FiSend className="h-5 w-5" />
					</div>
					<FollowEventButton
						eventId={event.id}
						isFollowing={event.followers && event.followers.some((f) => f.id === userId)}
					/>
				</div>
				{likeCount > 0 && <p className="font-light text-sm">{likeCount} likes</p>}
				<CommentInput type={"event"} postId={event.id} />
			</section>
		</div>
	);
};

export default EventDetail;
