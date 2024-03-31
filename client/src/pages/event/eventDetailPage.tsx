import EventDetail from "./_components/EventDetail";
import CommentBox from "../components/CommentBox";
import { Events } from "../../types/post";
import { Post } from "../../types/post";
import News from "../components/NewsPost";
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";


const EventDetailPage: React.FC = () => {
	const { user } =  useAuth();
	const { id } = useParams< {id?: string}>();
	const [authUserId, setAuthUserId] = useState<number>(0);
	const [event, setEvent] = useState<Events | null>(null);
  const [club, setClub] = useState<any>(null);

	useEffect(() => {
		const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
        if (response.status === 200) {
          const fetchedUserId = response.data.id;
          setAuthUserId(fetchedUserId); 
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

    const fetchEventAndClub = async () => {
			if (id) {
				try {
					const response = await axios.get(`http://localhost:3001/events/${id}`);
					if (response.status === 200) {
						setEvent(response.data);
						console.log('success fetch event');
					} else {
						console.log('Failed to fetch event');
					};
					const clubResponse = await axios.get(`http://localhost:3001/clubs/${response.data?.clubId}`);
					if (clubResponse.status === 200) {
						setClub(clubResponse.data);
						console.log('success fetch club');
					} else {
						console.log('Failed to fetch club');
					};
				} catch (error) {
					console.error('Error fetching data:', error);
				}
    	};
		};
    fetchEventAndClub();
		
  }, [id,  user?.stdId, authUserId]);

	if (!event) {
		return <div>Event not found</div>;
	}

	return (
		<div className="flex min-h-screen flex-col items-center bg-white">
			<div className="h-fit w-full relative">
				<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
					<img
						src={event.imageUrl || "/event.png"}
						width={0}
						height={0}
						sizes="100vw"
						style={{ width: "auto", maxHeight: "100%", maxWidth: "100%" }}
						alt={"event"}
					/>
				</div>
				<div className="absolute w-full bottom-0 p-3 font-bold bg-[#006664] text-white rounded-t-xl">
					{event.club.label}
				</div>
			</div>
			<EventDetail event={event} />
			<div className="w-full px-8 flex flex-col gap-3 mb-4">
				{event.comments.map((c) => (
					<CommentBox
						name={`${c.user.firstNameTh} ${c.user.lastNameTh}`}
						message={c.message}
						createdAt={c.createdAt}
						isYou={user ? user.id === c.userId : false}
						firstChar={c.user.firstNameEn.substring(0, 1)}
						key={c.id}
					/>
				))}
			</div>
			<p className="font-bold text-[24px] w-full px-8 mb-2">อีเว้นท์ต่างๆจากชมรม</p>
			<div className="w-full px-8 flex flex-col gap-4">
				{club?.events.map((p: Post) => (
					<News post={p} key={p.id} />
				))}
			</div>
		</div>
	);
};

export default EventDetailPage;
