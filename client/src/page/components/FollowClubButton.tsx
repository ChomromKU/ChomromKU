// import { Button } from "@mantine/core";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

type FollowClubButtonProps = {
    role: string;
    clubId: number;
    isFollowing?: boolean;
};

export default function FollowClubButton({ role, clubId, isFollowing }: FollowClubButtonProps) {
	const navigate = useNavigate(); // Initialize useNavigate hook

	async function handleClick() {
		const status = isFollowing ? "unfollow" : "follow";
		try {
			const res = await axios.post(`/api/clubs/${clubId}/follow?status=${status}`);
			navigate('/', { replace: true }); // Use navigate to refresh the page
		} catch (error) {
			console.error(error);
		}
	}

	console.log(role);
	if (role === 'PRESIDENT' || role === 'VICE_PRESIDENT') {
		return (
			<button
                className="text-sm py-1 px-4 border rounded-full"
			>
				แก้ไข
			</button>
		);
	}

	return (
		<button
            className="text-sm py-1 px-4 border rounded-full"
			onClick={handleClick}
		>
			{isFollowing ? "เลิกติดตาม" : "ติดตาม"}
		</button>
	);
}