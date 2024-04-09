import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, LinkProps, useNavigate, useParams } from 'react-router-dom';

import EventBox from '../components/EventBox';
import ClubPosts from "../components/ClubPosts";

import { getCategoryInThai } from "../../lib/event";
import FollowClubButton from "../components/FollowClubButton";
import RegisterButton from "../components/RegisterButton";

import eventImage from '../../images/event.png'
import lineIcon from '../../images/line.svg'
import facebookIcon from '../../images/facebook.svg'
import instagramIcon from '../../images/instagram.svg'
import { Events, Post, PostType } from '../../types/post';
import { Club, ClubMember, SocialMedia, ClubEvent } from '../../types/club';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/auth';
import { set } from 'zod';

interface CustomLinkProps extends LinkProps {
	state?: {
		role: string | undefined;
		clubLabel: string
	};
}


const CustomLink: React.FC<CustomLinkProps> = ({ state, ...rest }) => (
	<Link {...rest} to={rest.to} state={state} />
);

export default function ClubProfile() {
	const { user } = useAuth()
	const [roleUser, setRoleUser] = useState<string>("")
    const { id } = useParams();
    const [club, setClub] = useState<Club>();
	const [members, setMembers] = useState<ClubMember[]>([]);
	const [currentUser, setCurrentUser] = useState<User>()
    const [upcomingEvents, setUpcomingEvents] = useState<Events[]>([]);
    const [socialMedia, setSocialMedia] = useState<SocialMedia>()
    const [editing, setEditing] = useState<boolean>(false);
    const [editedFields, setEditedFields] = useState<Partial<Club>>({});
	const [posts, setPosts] = useState<Post[]>([]);
	const [events, setEvents] = useState<Events[]>([]);
	const [userId, setUserId] = useState<number>(0);
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
		const fetchPosts = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}/posts`);
				
				if(data) {
					setPosts(data);
				} else {
                    console.error('Post data not found in response:', data);
                }
            } catch (error) {
                console.error('Error fetching clubs:', error);
                setError(true)
            }
		};
		const fetchEvents = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}/events`);
				
				if(data) {
					const currentDate = new Date().getTime();
					const presentEvents = data.filter((event: ClubEvent) => {
						const startDate = new Date(event.startDate).getTime();
						const endDate = new Date(event.endDate).getTime();
						return startDate <= currentDate && currentDate <= endDate;
					});
					const upcomingEvents = data.filter((event: ClubEvent) => {
						const startDate = new Date(event.startDate).getTime();
						return startDate > currentDate;
					});

					const combinedEvents = [...presentEvents, ...upcomingEvents];

					setUpcomingEvents(combinedEvents.sort((a, b) => {
						const startDateA = new Date(a.startDate).getTime();
						const startDateB = new Date(b.startDate).getTime();
						return startDateA - startDateB;
					}));
					setEvents(data)
				} else {
                    console.error('Post data not found in response:', data);
                }
            } catch (error) {
                console.error('Error fetching clubs:', error);
                setError(true)
            }
		};
		const fetchClubs = async () => {
			try {
				const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClub(data);
				setError(false);

				if (data.members) {
					setMembers(data.members);
					setRoleUser(data.members.find((member: ClubMember) => member.user.stdId === user?.stdId)?.role)
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
		const fetchData = async () => {
			// console.log('fetch posts');
			await fetchPosts(); // Wait for fetchPosts to complete
			await fetchEvents(); // Wait for fetchPosts to complete
			// console.log('fetch club');
			fetchClubs(); // Now fetchClubs can be called
			fetchCurrentMember();
		};
		fetchData();
	}, [id, user?.stdId, userId]);

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
					data-testid="club-image"
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
				<h1 data-testid="club-label" className="font-bold text-[24px]">{club?.label}</h1>
				<div data-testid="club-information">
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
							value={editedFields.socialMedia?.line}
							className='bg-transparent border-b opacity-70 w-full mb-[7px] focus-visible:outline-none'
							onChange={(e) =>
								handleFieldChange('socialMedia', {
								  ...editedFields.socialMedia,
								  line: e.target.value,
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
							isFollowing={club.subscribers.some((s) => s.id === userId)}
							editing={editing} 
							setEditing={setEditing}
							updateClub={updateClub}
							setEditedFields={setEditedFields}
						/>
						{!editing && 
							<RegisterButton
								clubLabel={club.label}
								member={members.find(member => member.user.stdId === user?.stdId)}
								userId={currentUser?.id}
								editing={editing}
							/>
						}
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
							<Link to={socialMedia?.line ? socialMedia?.line : '/'} className="flex items-center">
								<img alt="line" src={lineIcon} width="24" height="24" />
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* ------------------------------ upcoming event ------------------------------*/}

			<div>
				<div className="flex justify-between px-[24px] pt-[24px]">
					<h1 data-testid="upcoming-events" className="font-bold text-[#006664]">Upcoming Event</h1>
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
				<h1 data-testid="club-members"className="font-bold">จำนวนสมาชิก {members.length ?? 0} คน</h1>
					<CustomLink
						to={`/clubs/${club?.id}/members`}
						state={{ role: (members.find(member => member.user.stdId === user?.stdId)?.role), clubLabel: club.label }}
						className="text-[12px] underline underline-offset-2 text-center h-min my-auto"
					>
						ดูสมาชิกทั้งหมด
					</CustomLink>
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
					<p data-testid="club-posts" className="font-bold text-[24px] w-full ">โพสต์</p>
					{(roleUser === "PRESIDENT" || roleUser === "VICE_PRESIDENT" || roleUser === "ADMIN") && (
						<Link to={"/clubs/" + club.id + "/posts/requested"} className="w-min whitespace-nowrap underline h-min my-auto text-[12px]">
							โพสต์ที่รออนุมัติ
						</Link>
					)}
				</div>

				<ClubPosts posts={posts.filter(post => post.approved)} events={events} clubId={club.id} clubLabel={club.label} />
			</div>
		</div>
	);
}