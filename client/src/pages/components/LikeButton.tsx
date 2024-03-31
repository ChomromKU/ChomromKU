import axios from "axios";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa6";
import { useAuth } from "../../hooks/useAuth";

type LikeButtonProps = {
	isLike: boolean;
	like: () => void;
	unlike: () => void;
	postId: number;
	type: "event" | "post";
};

export default function LikeButton({ isLike, like, unlike, postId, type }: LikeButtonProps) {
  const { user } = useAuth();

	async function handleClickLike() {
		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}
		try {
			const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
			if (response.status === 200) {
				const userId = response.data.id;
				await axios.post(`http://localhost:3001/posts/${postId}/like`, {
				type,
				userId: userId,
				postId,
			});
			like();
			} else {
				console.error('Failed to fetch user id');
			}
		} catch (error) {
			console.error("Post like failed: ", error);
		}
	}

	async function handleClickUnlike() {
		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}

		try {
			const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
			if (response.status === 200) {
				const userId = response.data.id;
				await axios.delete(`http://localhost:3001/posts/${postId}/like?type=${type}`, {
					data: { userId: userId },
				});
				unlike();
			} else {
				console.error('Failed to fetch user id');
			}
		} catch (error) {
			console.error("Unlike failed: ", error);
		}
	}

	if (isLike) {
		return <FaHeart className="h-5 w-5 cursor-pointer text-red-500" onClick={handleClickUnlike} />;
	}

	return <FiHeart className="h-5 w-5 cursor-pointer" onClick={handleClickLike} />;
}
