// import { cache } from "react";
import PostForm from "../../../components/PostForm";
import { useAuth } from "../../../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import { Club } from "../../../../types/club";
import { useParams } from "react-router-dom";





export default function NewEventPage(){
	const { user } = useAuth();
    const [clubs, setClubs] = useState<Club>();
    const { id } = useParams();

    // const club = await fetchClub(parseInt(params.id));
    // TODO: cache this
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClubs(data);
            } catch (error) {
                console.error('Error fetching clubs:', error);
            }
        };
		fetchClubs();
    }, [id]);

    // const member = await prisma.member.findUnique({ where: { clubId: parseInt(params.id), userId: session?.user.id } });
    // หาuser ที่เป็น member ของ club นี้


	if (!user) {
		return <div className="flex items-center justify-center">เข้าสู่ระบบเพื่อสร้างโพสต์</div>;
	}

	if (!clubs) return null;

	return (
		<div className="flex flex-col">
			<div className="bg-[#006664] px-6 py-4">
				<span className="text-white font-bold">{clubs.label}</span>
			</div>
			<PostForm />
		</div>
	);
}
