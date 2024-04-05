import { useState, useEffect } from "react";
import EventDetail from "./_components/EventDetail";
import CommentBox from "../components/CommentBox";
import { Events } from "../../types/post";
import NewsEvent from "../components/NewsEvent";
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";
import axios from "axios";


const EventDetailPage: React.FC = () => {
	const { user } =  useAuth();
	const { id } = useParams< {id?: string}>();
    const [userId, setUserId] = useState<number>(0);
	const [event, setEvent] = useState<Events | null>(null);
  	const [club, setClub] = useState<any>(null);

	useEffect(() => {
		if (user) {
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
			fetchUserId();
		}

		const fetchEventAndClub = async () => {
			setEvent(null)
			setClub(null)
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
		window.scrollTo({ top: 0 });
		
  }, [id]);


	if (!event) {
		return <div>Event not found</div>;
	}

	return (
		<div className="flex min-h-screen w-full flex-col items-center bg-white relative">
			{event.imageUrl && 
				<div className="h-fit w-full">
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
						<img
							src={event.imageUrl}
							width={0}
							height={0}
							sizes="100vw"
							style={{ width: "100%", height: "320px", maxWidth: "100%" }}
							alt={"event"}
						/>
					</div>
				</div>
			}
			 <div className={`${event.imageUrl && 'translate-y-[-24px]'} w-full`}>
			 	<div className={`w-full px-[24px] py-[15px] font-bold bg-[#006664] text-white ${event.imageUrl && 'rounded-t-[20px]'}`}>
					{event.club.label}
				</div>
				<div className={`${event.imageUrl ? 'px-[24px] pt-[24px]' : 'p-[24px]'}`}>
					<EventDetail event={event} />
					<div className="w-full pb-[24px] flex flex-col gap-[15px] mt-[15px]">
						{event.comments.map((c, index) => (
							<CommentBox
								name={`${c.user.firstNameTh} ${c.user.lastNameTh}`}
								message={c.message}
								createdAt={c.createdAt}
								isYou={user ? userId === c.userId : false}
								firstChar={c.user.firstNameEn.substring(0, 1)}
								isLast={index === event.comments.length - 1}
								key={c.id}
							/>
						))}
					</div>
					<p className="font-bold text-[24px] w-full mb-[20px]">อีเว้นท์ต่างๆจากชมรม</p>
					<div className="w-full flex flex-col gap-[20px]">
						{club?.events.filter((e:Events ) => e.id !== event.id).map((event: Events) => (
							<NewsEvent event={event} clubLabel={club?.label} key={event.id} />
						))}
					</div>
				</div>
				
			 </div>
		</div>
	);
};

export default EventDetailPage;
