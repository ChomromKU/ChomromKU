import { useEffect, useState } from "react";
import Tag from "../../components/Tag";
import ShareButton from "../../components/ShareButton";
import CommentInput from "../../components/CommentInput";
import { Events } from "../../../types/post";
import FollowEventButton from "./FollowEventButton";
import LikeButton from "../../components/LikeButton";
import { useAuth } from "../../../hooks/useAuth";
import { useParams } from "react-router-dom";
import axios from "axios";
import { postTypeToColorMap, postTypeToLabelPost, getPostTypeEnumValue } from "../../../lib/post"

type EventDetailProps = {
	event: Events;
};

const EventDetail = ({ event }: EventDetailProps) => {
	console.log(event);
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
		const fetchIsLike = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
          if (response.status === 200) {
						setUserId(response.data.id);
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

	const like = () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev + 1);
	};
	const unlike = async () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev - 1);
	};

	return (
		<div className="w-full flex flex-col gap-[15px]">
			<header>
				<div className="flex justify-between font-light text-[12px] mb-[15px]">
					<p>
						โดย {event.owner?.firstNameTh} {event.owner?.lastNameTh}
					</p>
					<p>
						{event.createdAt ? (new Date(event.createdAt)).toLocaleDateString("th-TH", {
							year: "numeric",
							month: "long",
							day: "numeric",
						}) : 'ไม่ระบุเวลาที่โพส'}
					</p>
				</div>
				<div className="flex flex-col gap-[15px]">
					<p data-testid="event-title" className="text-2xl font-bold">{event.title}</p>
					<p data-testid="event-date" className="font-normal">วันเริ่มต้นและสิ้นสุด: {Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
						new Date(event.startDate),)} - {Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
						new Date(event.endDate),)}
					</p>
					<p data-testid="event-location" className="font-normal">สถานที่จัดกิจกรรม: {event.location}</p>
					<p data-testid="event-time" className="font-normal">ณ เวลา {event.startTime} - {event.endTime}</p>
				</div>
			</header>
			<section className="flex flex-col gap-4">
				<Tag tagName={"อีเว้นท์"} color={"bg-[#F24B4B]"} />
				<p data-testid="event-content" className="font-light break-all">{event.content}</p>
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<LikeButton isLike={isLike} like={like} unlike={unlike} postId={event.id} type="event" />
						<ShareButton />
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
