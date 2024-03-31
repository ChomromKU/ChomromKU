import axios from "axios";
import { VscSend } from "react-icons/vsc";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

type CommentInputProps = {
	postId: number;
	type: "event" | "post";
};

export default function CommentInput({ postId, type }: CommentInputProps) {
	const { user } = useAuth();
	const [comment, setComment] = useState<string>("");


	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}
		try {
			const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
      if (response.status === 200) {
				await axios.post(`http://localhost:3001/posts/${postId}/comment`, {
				userId: response.data.id,
				type: type,
				message: comment,
				postId,
			});
			setComment("");
			window.location.reload();
			} else {
				console.error('Failed to fetch user id');
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="flex border-2 rounded-full">
			<form className="flex items-center w-full" onSubmit={onSubmit}>
				<input
					placeholder="แสดงความคิดเห็น"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					className="rounded-full flex-1 px-5 py-2 border-none focus:outline-none"
				/>
				<button type="submit" className="px-4">
					<VscSend className="h-5 w-5 cursor-pointer" />
				</button>
			</form>
		</div>
	);
}
