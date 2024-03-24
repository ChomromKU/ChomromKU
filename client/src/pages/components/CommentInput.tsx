"use client";

import axios from "axios";
import { useState } from "react";
import { VscSend } from "react-icons/vsc";

type CommentInputProps = {
	postId: number;
	type: "event" | "post";
};

export default function CommentInput({ postId, type }: CommentInputProps) {
	const [comment, setComment] = useState<string>("");

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		try {
			await axios.post(`http://localhost:3001/posts/${postId}/comment`, {
				type: type,
				message: comment,
			});
			setComment("");
			window.location.reload(); // Refresh the page
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
