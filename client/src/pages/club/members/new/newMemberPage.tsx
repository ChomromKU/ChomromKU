// import authOptions from "@/app/api/auth/[...nextauth]/options";
// import { getServerSession } from "next-auth";
import { useParams, useLocation } from "react-router-dom";
import MemberPostForm from "./_components/MemberPostForm";
import { useEffect, useState } from "react";
import axios from "axios";

import { Club } from "../../../../types/club";
// import { cache } from "react";
// import prisma from "@/lib/prisma";

export default function NewMemberPage() {
    const { id, userId } = useParams();
    const [club, setClub] = useState<Club>()
    const location = useLocation();
    const { member } = location.state || {};

    // const session = await getServerSession(authOptions);
    // const club = await fetchClub(parseInt(params.id));

    // if (!session) {
    //     return (
    //         <div className='flex justify-center'>
    //             กรุณาเข้าสู่ระบบเพื่อสมัครสมาชิกชมรม
    //         </div>
    //     )
    // };

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3001/clubs/${id}`);
                setClub(data);
            } catch (error) {
                console.error('Error fetching clubs:', error);
            }
        };
        fetchClubs();
    }, [id]);

    console.log(member);

    return (
        <div className="flex flex-col">
            <div className="bg-[#006664] px-6 py-4">
                <span className="text-white font-bold">{club?.label}</span>
            </div>
            <MemberPostForm id={id as string} userId={userId as string}/>
        </div>
    );
}