// import { cache } from "react";
import axios from "axios";
import PostForm from "../../../components/PostForm";
import Link from "react-router-dom";
import News from "../../../components/NewsPost";
import { useAuth } from "../../../../hooks/useAuth";
import Modal from "../../../components/CustomModal";
import { User } from "../../../../types/auth";
import { Post, Events } from "../../../../types/post";
import { useDisclosure } from "@mantine/hooks";
import NewsEvent from "../../../components/NewsEvent";
import { ClubMember } from "../../../../types/club";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Club } from "../../../../types/club";

export default function RequestedPostsPage() {
	const { id } = useParams();
	const [clubs, setClubs] = useState<Club | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [events, setEvents] = useState<Events[]>([]);
	const [members, setMembers] = useState<ClubMember[]>([]);
	const { user } = useAuth();

	const fetchUnApprovedPosts = async () => {
		try {
			const { data } = await axios.get(`http://localhost:3001/clubs/${id}/posts/unapproved`);
			setPosts(data);
		} catch (error) {
			console.error('Error fetching UnApprovedPosts:', error);
		}
	};

	const reFetchPost = async () => {
        try {
            fetchUnApprovedPosts();
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClubs(data);
				if (data.events) {
					setEvents(data.events);
				} else {
					console.error('Events data not found in response:', data);
				}

				if (data.members) {
					setMembers(data.members);
				} else {
					console.error('Members data not found in response:', data);
				}

            } catch (error) {
                console.error('Error fetching clubs:', error);
            }
        };
		fetchClubs();
		fetchUnApprovedPosts();
    }, []);


	// const club = await prisma.club.findUnique({
	// 	where: { id: parseInt(params.id) },
	// 	include: {
	// 		posts: {
	// 			where: { approved: false },
	// 			orderBy: { createdAt: "desc" },
	// 			include: { club: true, owner: true, likes: true },
	// 		},
	// 		events: {
	// 			where: { approved: false },
	// 			orderBy: { createdAt: "desc" },
	// 			include: { club: true, owner: { select: { user: true } }, likes: true },
	// 		},
	// 	},
	// });
	// const session = await getServerSession(authOptions);
	// const member = session ? await fetchMemberByUserId(session.user.id) : undefined;

	if (!clubs) return null;

	return (
		<div className="flex flex-col">
			<div className="px-6 pt-4">
				<span className="text-[#2F3337] text-2xl font-bold">{clubs.label}</span>
			</div>

			<div className="p-[24px] flex flex-col">
				<p className="font-bold text-base">อนุมัติโพสต์</p>
				<div className="flex flex-col gap-[20px]">
					<div className="flex justify-between w-full"></div>
					{(events.filter((event) => !event.approved).length > 0 || posts.filter((post) => !post.approved).length > 0) ? (
						<>
							{events.filter((event) => !event.approved).length > 0 && (
								events.filter((event) => !event.approved).map((p) => (
									<div key={p.id}>
										<NewsEvent 
											event={p} 
											role={(members.find(member => member.user.stdId === user?.stdId))?.role} 
											clubLabel={clubs.label}
											reFetchPost={reFetchPost}
										/>
									</div>
								))
							)}
							{posts.filter((post) => !post.approved).length > 0 && (
								posts.filter((post) => !post.approved).map((p) => (
									<div key={p.id}>
										<News 
											post={p} 
											role={(members.find(member => member.user.stdId === user?.stdId))?.role} 
											reFetchPost={reFetchPost}
										/>
									</div>
								))
							)}
						</>
					) : (
						"No waiting requested posts"
					)}
				</div>
			</div>
		</div>
	);
}
