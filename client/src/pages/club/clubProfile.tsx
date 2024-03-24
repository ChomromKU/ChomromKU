import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// import EventBox from "@/components/EventBox";
import EventBox from '../components/EventBox';
import ClubPosts from "../components/ClubPosts";

import { getCategoryInThai } from "../../lib/event";
import FollowClubButton from "../components/FollowClubButton";
import RegisterButton from "../components/RegisterButton";

import eventImage from '../../images/event.png'
import lineIcon from '../../images/line.svg'
import facebookIcon from '../../images/facebook.svg'
import instagramIcon from '../../images/instagram.svg'
import { PostType } from '../../types/post';
import { Club, ClubMember, SocialMedia, ClubEvent } from '../../types/club';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/auth';

const posts = [{
    id: 1,
    title: 'Sample Title 1',
    type: PostType.NORMAL_POST,
    content: 'Lorem ipsum dolor sit amet 1.',
    imageUrl: 'some-url-1',
    approved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    comments: [],
    club: { id: 1, label: 'Sample Club', branch: 'Some Branch', category: 'Some Category', location: 'Some Location', phoneNumber: '1234567890', socialMedia: {facebook: '', instagram: '', twitter: ''}},
    clubId: 1,
    owner: {
		id: 1,
		stdId: "1234567890",
		stdCode: "ABC123",
		titleTh: "นาย",
		titleEn: "Mr.",
		firstNameTh: "ชื่อไทย",
		lastNameTh: "นามสกุลไทย",
		firstNameEn: "First Name",
		lastNameEn: "Last Name",
		campusNameTh: "ชื่อวิทยาลัย (ไทย)",
		campusNameEn: "College Name (English)"
	  },
    ownerId: 1,
}, 
{
    id: 2,
    title: 'Sample Title 2',
    type: PostType.NORMAL_POST,
    content: 'Lorem ipsum dolor sit amet 2.',
    imageUrl: 'some-url-2',
    approved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    comments: [],
    club: { id: 2, label: 'Sample Club 2', branch: 'Some Branch 2', category: 'Some Category 2', location: 'Some Location 2', phoneNumber: '9876543210', socialMedia: {facebook: '', instagram: '', twitter: ''}},
    clubId: 2,
    owner: {
		id: 1,
		stdId: "1234567890",
		stdCode: "ABC123",
		titleTh: "นาย",
		titleEn: "Mr.",
		firstNameTh: "ชื่อไทย",
		lastNameTh: "นามสกุลไทย",
		firstNameEn: "First Name",
		lastNameEn: "Last Name",
		campusNameTh: "ชื่อวิทยาลัย (ไทย)",
		campusNameEn: "College Name (English)"
	  },
    ownerId: 2,
}];


export default function ClubProfile() {
	const { user } = useAuth()
    const { id } = useParams();
    const [club, setClub] = useState<Club>();
	const [members, setMembers] = useState<ClubMember[]>([]);
	const [currentUser, setCurrentUser] = useState<User>()
    const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
    const [socialMedia, setSocialMedia] = useState<SocialMedia>()
    const [editing, setEditing] = useState<boolean>(false);
    const [editedFields, setEditedFields] = useState<Partial<Club>>({});

    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
		const fetchClubs = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClub(data);
				setError(false);
				console.log(data);

				const currentDate = new Date().getTime();
				const presentEvents = data.events.filter((event: ClubEvent) => {
					const startDate = new Date(event.startDate).getTime();
					const endDate = new Date(event.endDate).getTime();
					return startDate <= currentDate && currentDate <= endDate;
				});
				const upcomingEvents = data.events.filter((event: ClubEvent) => {
					const startDate = new Date(event.startDate).getTime();
					return startDate > currentDate;
				});

				const combinedEvents = [...presentEvents, ...upcomingEvents];

				if (data.events) {
					setUpcomingEvents(combinedEvents.sort((a, b) => {
						const startDateA = new Date(a.startDate).getTime();
						const startDateB = new Date(b.startDate).getTime();
						return startDateA - startDateB;
					}));
				} else {
					console.error('Events data not found in response:', data);
				}

				if (data.members) {
					setMembers(data.members);
				} else {
					console.error('Members data not found in response:', data);
				}

				if (data.socialMedia) {
                    setSocialMedia(data.socialMedia);
                } else {
                    console.error('Social Media data not found in response:', data);
                }

            } catch (error) {
                console.error('Error fetching clubs:', error);
                setError(true)
            }
		};
		const fetchCurrentMember = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
				setCurrentUser(data);
			} catch (error) {
				console.error('Error fetching clubs:', error);
			}
		};
		fetchClubs();
		fetchCurrentMember()
	}, [id]);

	const handleFieldChange = (fieldName: string, value: string | SocialMedia) => {
        setEditedFields((prevFields) => ({ ...prevFields, [fieldName]: value }));
    };

    const updateClub = async () => {
        try {
          await axios.put(`http://localhost:3001/clubs/${id}`, editedFields);
          setClub((prevClub) => {
            if (!prevClub) return prevClub;
            return { ...prevClub, ...editedFields };
          });
          setEditing(false);
        } catch (error) {
          console.error('Error updating club:', error);
        }
    };

	if (!club) {
		return <div>Loading</div>;
    } else if(error) {
        return <div>Club id not found</div>;
	}
	
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
				<h1 className="font-bold text-[24px]">{club?.label}</h1>
				<div>
					<p>
						หมวดหมู่: {editing ? (
							<input
							type="text"
							value={editedFields.category}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) => handleFieldChange('category', e.target.value)}
							/>
						) : (
							<span>{getCategoryInThai(club.category)}</span>
						)}
					</p>
					<p>
						ที่อยู่: {editing ? (
							<textarea
								value={editedFields.location}
								onChange={(e) => handleFieldChange('location', e.target.value)}
								className='bg-transparent border-b opacity-70 w-full resize-none focus-visible:outline-none'
								rows={3} // Set the number of rows
							/>
						) : (
							<span>{club.location}</span>
						)}
					</p>
					<p>
						โทรศัพท์: {editing ? (
							<input
							type="text"
							value={editedFields.phoneNumber}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
							/>
						) : (
							<span>{club.phoneNumber}</span>
						)}
					</p>
					{editing && (
						<>
							<p>
								Facebook:
							</p>
							<input
							type="text"
							value={editedFields.socialMedia?.facebook}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) =>
								handleFieldChange('socialMedia', {
								  ...editedFields.socialMedia,
								  facebook: e.target.value,
								})
							  }
							/>
						</>
						
					)}
					{editing && (
						<>
							<p>
							Instagram:
							</p>
							<input
							type="text"
							value={editedFields.socialMedia?.instagram}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) =>
								handleFieldChange('socialMedia', {
								  ...editedFields.socialMedia,
								  instagram: e.target.value,
								})
							  }
							/>
						</>
						
					)}
					{editing && (
						<>
							<p>
								Line:
							</p>
							<input
							type="text"
							value={editedFields.socialMedia?.twitter}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) =>
								handleFieldChange('socialMedia', {
								  ...editedFields.socialMedia,
								  twitter: e.target.value,
								})
							  }
							/>
						</>
						
					)}
				</div>
				<div className="flex justify-between">
					<div className="flex gap-[10px]">
						<FollowClubButton
							member={members.find(member => member.user.stdId === user?.stdId)}
							club={club}
							clubId={club.id}
							// isFollowing={club.subscribers.some((s) => s.id === session?.user.id)}
							isFollowing={false}
							editing={editing} 
							setEditing={setEditing}
							updateClub={updateClub}
							setEditedFields={setEditedFields}
						/>
						<RegisterButton
							member={members.find(member => member.user.stdId === user?.stdId)}
							userId={currentUser?.id}
							editing={editing}
						/>
					</div>
					{/* {club.socialMedia && ( */}
					{!editing && (
						<div className="flex gap-[10px]">
							<Link to={socialMedia?.facebook ? socialMedia?.facebook : '/'} className="flex items-center">
								<img alt="facebook" src={facebookIcon} width="20" height="20" />
							</Link>
							<Link to={socialMedia?.instagram ? socialMedia?.instagram : '/'} className="flex items-center">
								<img alt="instagram" src={instagramIcon} width="20" height="20" />
							</Link>
							<Link to={socialMedia?.twitter ? socialMedia?.twitter : '/'} className="flex items-center">
								<img alt="line" src={lineIcon} width="24" height="24" />
							</Link>
						</div>
					)}
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
								type='upcoming'
							/>
						</Link>
					))}
				</div>
			</div>

			{/* ------------------------------ club members ------------------------------*/}

			<div className="bg-[#FFFFDD]">
				<div className="flex justify-between px-[24px] pt-[24px]">
				<h1 className="font-bold">จำนวนสมาชิก {members.length ?? 0} คน</h1>
					<Link
						to={`/clubs/${club?.id}/members`}
						className="text-[12px] underline underline-offset-2 text-center h-min my-auto"
					>
						ดูสมาชิกทั้งหมด
					</Link>
				</div>
				<div className="flex gap-[15px] px-[24px] pb-[24px] pt-[15px] overflow-auto">
					{members.map((member) => (
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
				<div className="flex">
					<p className="font-bold text-[24px] w-full ">โพสต์</p>
					{/* {session && member && ( */}
						<Link to={"/clubs/" + club.id + "/posts/requested"} className="w-min whitespace-nowrap underline h-min my-auto text-[12px]">
							โพสต์ที่รออนุมัติ
						</Link>
					{/* )} */}
				</div>

				<ClubPosts posts={posts} clubId={club.id} />
			</div>
		</div>
	);
}