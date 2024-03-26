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


// const fetchPostsNotApprovedPost = cache((clubId: number) =>
// 	prisma.post.findMany({
// 		where: { clubId: clubId, approved: false },
// 		include: { club: true, owner: true, likes: true },
// 	}),
// );

// const fetchEventsNotApprovedPost = cache((clubId: number) =>
// 	prisma.event.findMany({
// 		where: { clubId: clubId, approved: false },
// 		include: { club: true, owner: true, likes: true },
// 	}),
// );

// const fetchMemberByUserId = cache((userId: number) =>
// 	prisma.member.findUnique({
// 		where: { userId: userId },
// 	}),
// );

// const fetchUserByUserId = cache((userId: number) =>
// 	prisma.user.findUnique({
// 		where: { id: userId },
// 	}),
// );

export default function RequestedPostsPage() {
	const { id } = useParams();
	// const [clubs, setClubs] = useState<Club>();
	const [clubs, setClubs] = useState<Club | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [events, setEvents] = useState<Events[]>([]);
	const [members, setMembers] = useState<ClubMember[]>([]);
	const { user } = useAuth();

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClubs(data);

                if (data.posts) {
					setPosts(data.posts);
				} else {
					console.error('Post data not found in response:', data);
				}

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
    }, [id]);


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

			<div className="p-[24px] flex flex-col gap-[20px] ">
				<p className="font-bold text-base">อนุมัติโพสต์</p>
				<div className="items-center">
					<div className="flex justify-between w-full"></div>
					{events
						? events.map((p) => (
								<div key={p.id}>
									<NewsEvent 
									event={p} 
									role={(members.find(member => member.user.stdId === user?.stdId))?.role} 
									club={clubs} />
								</div>
						  ))
						: "No waiting requested posts"}
					{posts
						? posts.map((p) => (
								<div key={p.id}>
									<News post={p} role={(members.find(member => member.user.stdId === user?.stdId))?.role} />
								</div>
						  ))
						: "No waiting requested posts"}
				</div>
			</div>
		</div>
	);
}
