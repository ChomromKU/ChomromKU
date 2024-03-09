import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// import EventBox from "@/components/EventBox";
import EventBox from '../components/EventBox';
// import ClubPosts from "./_components/ClubPosts";

import { getCategoryInThai } from "../../lib/event";
// import FollowClubButton from "@/components/FollowClubButton";
// import RegisterButton from "./_components/RegisterButton";

import eventImage from '../../images/event.png'
import lineIcon from '../../images/line.svg'
import facebookIcon from '../../images/facebook.svg'
import instagramIcon from '../../images/instagram.svg'



type Club = {
	id: number;
	label: string;
	branch: string;
    category: string;
    location: string;
    phoneNumber: string;
	members?: Member[];
};

type Event = {
	id: number;
	title: string;
	startDate: string;
	endDate: string;
	location: string;
};

type Member = {
	id: number;
	role: string;
	user: {
		firstNameTh: string;
		firstNameEn: string;
	};
};

export default function ClubProfile() {
    const { id } = useParams();
    const [club, setClub] = useState<Club>();
	const [members, setMembers] = useState<Member[]>([]);
	const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

    useEffect(() => {
		const fetchClubs = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClub(data);
                // console.log(data);
			} catch (error) {
				console.error('Error fetching clubs:', error);
			}
		};
		fetchClubs();
	}, [id]);
	
	

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
				if (data.events) {
					setUpcomingEvents(data.events);
				} else {
					console.error('Events data not found in response:', data);
				}
			} catch (error) {
				console.error('Error fetching events:', error);
			}
		};
		fetchEvents();
	}, [id]);
	
	

	useEffect(() => {
		const fetchMembers = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}/members`);
				setMembers(data);
			} catch (error) {
				console.error('Error fetching club members:', error);
			}
		};
		fetchMembers();
	}, [id]);	

    
	return (
        <div>
			{/* ------------------------------ images ------------------------------*/}

			<div className="w-full h-[270px] relative -z-10 flex justify-center">
				<img
					src={eventImage}
					width={0}
					height={0}
					sizes="100vw"
					style={{ width: "auto", height: "100%", objectFit: "cover" }}
					alt={"event"}
				/>
			</div>

			{/* ------------------------------ club detail ------------------------------*/}

			<div className="bg-[#006664] w-ful flex flex-col gap-[15px] p-[24px] text-white rounded-t-[20px] relative -mt-[20px]">
				<h1 className="font-bold">{club?.label}</h1>
				<div>
					<p>
						หมวดหมู่: {club?.category && <span>{getCategoryInThai(club.category)}</span>}
					</p>
					<p>
						ที่อยู่: {club?.location && <span>{club.location}</span>}
					</p>
					<p>
						โทรศัพท์: {club?.phoneNumber && <span>{club.phoneNumber}</span>}
					</p>
				</div>
				<div className="flex justify-between">
					<div className="flex gap-[5px]">
						{/* <FollowClubButton
							role={member?.role}
							clubId={club.id}
							isFollowing={club.subscribers.some((s) => s.id === session?.user.id)}
						/>
						<RegisterButton member={member} clubId={club.id} /> */}
					</div>
					{/* {club.socialMedia && ( */}
						<div className="flex gap-[10px]">
							<Link to='/' className="flex items-center">
								<img alt="facebook" src={facebookIcon} width="16" height="16" />
							</Link>
							<Link to='/' className="flex items-center">
								<img alt="instagram" src={instagramIcon} width="16" height="16" />
							</Link>
							<Link to='/' className="flex items-center">
								<img alt="line" src={lineIcon} width="20" height="20" />
							</Link>
						</div>
					{/* )} */}
				</div>
			</div>

			{/* ------------------------------ upcoming event ------------------------------*/}

			<div>
				<div className="flex justify-between px-[24px] pt-[24px]">
					<h1 className="font-bold text-[#006664]">Upcoming Event</h1>
					<Link
						to={`/clubs/${club?.id}/events`}
						className="text-[12px] underline underline-offset-2 text-center h-min my-auto"
					>
						ดูตารางกิจกรรมทั้งหมด
					</Link>
				</div>
				<div className="flex gap-[10px] pl-[24px] pb-[24px] pt-[15px] pr-[24px] overflow-auto scrollbar-hide">
					{upcomingEvents.map(event => (
						<Link to={`/events/${event?.id}`} key={event.id}>
							<EventBox
								eventName={event.title}
								link={"/"}
								startDate={Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
									new Date(event.startDate),
								)}
								endDate={Intl.DateTimeFormat("th-TH", { year: "2-digit", month: "short", day: "numeric" }).format(
									new Date(event.endDate),
								)}
								location={event.location}
							/>
						</Link>
					))}
				</div>
			</div>

			{/* ------------------------------ club members ------------------------------*/}

			<div className="bg-[#FFFFDD]">
				<div className="flex justify-between px-[24px] pt-[24px]">
				<h1 className="font-bold">จำนวนสมาชิก {club?.members?.length ?? 0} คน</h1>
					<Link
						to={`/clubs/${club?.id}/members`}
						className="text-[12px] underline underline-offset-2 text-center h-min my-auto"
					>
						ดูสมาชิกทั้งหมด
					</Link>
				</div>
				<div className="flex gap-[15px] px-[24px] pb-[24px] pt-[15px] overflow-auto">
					{club?.members?.map((member) => (
						<div className="w-min h-min flex flex-col whitespace-nowrap gap-[10px]" key={member.id}>
							<div className="bg-[#006664] w-[32px] h-[32px] rounded-[20px] text-center flex items-center justify-center">
								<p className="text-white">{member.user.firstNameEn[0]}</p>
							</div>
							<p>{member.user.firstNameTh}</p>
						</div>
					))}
				</div>
			</div>

			{/* ------------------------------ club news ------------------------------*/}

			<div className="p-[24px] flex flex-col gap-[20px]">
				{/* <div className="flex">
					<p className="font-bold text-[24px] w-full ">โพสต์</p>
					{session && member && (
						<Link href={"/clubs/" + club.id + "/posts/requested"} className="w-min whitespace-nowrap underline h-min my-auto text-[12px]">
							โพสต์ที่รออนุมัติ
						</Link>
					)}
				</div> */}

				{/* <ClubPosts posts={club.posts} clubId={club.id} /> */}
			</div>
		</div>
	);
}