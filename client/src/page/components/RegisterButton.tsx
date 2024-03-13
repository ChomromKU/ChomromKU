import React from "react";
import { useNavigate } from 'react-router-dom';

type Member = {
    id: number;
    role: string;
    user: {
        firstNameTh: string;
        firstNameEn: string;
    };
};

interface RegisterButtonProps {
    member: Member | null;
    clubId: number;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({ member, clubId }) => {
    // const router = useRouter();
    const navigate = useNavigate();

    // const onClick = (path: string) => {
    //     router.push(/clubs/${clubId}/members/${path});
    // };

    // async function handleClick() {
    //     const status = isFollowing ? "unfollow" : "follow";
    //     try {
    //         const res = await axios.post(/api/clubs/${clubId}/follow?status=${status});
    //         navigate('/', { replace: true }); // Use navigate to refresh the page
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    if (!member) {
        return (
            <button
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className="text-sm py-1 px-4 rounded-full"
                // onClick={() => onClick("new")}
            >
                สมัครเข้าชมรม
            </button>
        );
    }

    if (member.role === 'PRESIDENT' || member.role === 'VICE_PRESIDENT') {
        return (
            <button
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className="text-sm py-1 px-4 border rounded-full"
                // onClick={() => onClick("requested")}
            >
                ผู้สมัครเข้าชมรม
            </button>
        );
    }

    return null;
};

export default RegisterButton;