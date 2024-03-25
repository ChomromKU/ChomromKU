import axios from "axios";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa6";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { User } from "../../types/auth";
import { useParams } from "react-router-dom";

type LikeButtonProps = {
	isLike: boolean;
	like: () => void;
	unlike: () => void;
	postId: number;
	type: "event" | "post";
};

export default function LikeButton({ isLike, like, unlike, postId, type }: LikeButtonProps) {
  const { id } = useParams();
  const { user } = useAuth();
  const [likerId, setLikerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
        if (response.status === 200) {
          const fetchedLikerId = response.data.id;
          setLikerId(fetchedLikerId); 
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
  }, [id, user?.stdId, likerId]);


	async function handleClickLike() {
		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}
		try {
			await axios.post(`http://localhost:3001/posts/${postId}/like`, {
				type,
				userId: likerId,
				postId,
			});
			like();
		} catch (error) {
			console.log(user);
			console.error("Post like failed: ", error);
		}
	}

	async function handleClickUnlike() {
		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}

		try {
			await axios.delete(`http://localhost:3001/posts/${postId}/like?type=${type}`, {
				data: { userId: likerId },
			});
			unlike();
		} catch (error) {
			console.error("Unlike failed: ", error);
		}
	}

	if (isLike) {
		return <FaHeart className="h-5 w-5 cursor-pointer text-red-500" onClick={handleClickUnlike} />;
	}

	return <FiHeart className="h-5 w-5 cursor-pointer" onClick={handleClickLike} />;
}
