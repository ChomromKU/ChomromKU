"use client";

import React, { useEffect, useState } from "react";
import Tag from "./Tag";
import { Post } from "../../types/post"
import { FiSend } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa6";
import { postTypeToColorMap, postTypeToLabelPost } from "../../lib/post"
import CommentInput from "./CommentInput";
import LikeButton from "./LikeButton";
import { useAuth } from "../../hooks/useAuth";

type PostDetailProps = {
	post: Post;
};

const PostDetail = ({ post }: PostDetailProps) => {
	const { user } = useAuth();

	const [likeCount, setLikeCount] = useState<number>(post.likes.length);
	const [isLike, setIsLike] = useState<boolean>(
		user ? post.likes.some((like) => like.userId === user.id) : false,
	);

	useEffect(() => {
		if (user) {
			setIsLike(post.likes.some((like) => like.userId === user.id));
		} else {
			setIsLike(false);
		}
	}, [user, post]);

	const like = () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev + 1);
	};
	const unlike = async () => {
		setIsLike((prev) => !prev);
		setLikeCount((prev) => prev - 1);
	};

	return (
		<div className="w-full p-[24px] flex flex-col gap-[10px]">
			<header>
				<div className="flex justify-between font-light text-sm mb-[10px]">
					<span>
						โดย {post.owner.firstNameTh} {post.owner.lastNameTh}
					</span>
					{post.createdAt && typeof post.createdAt === 'object' ? (
						<span>{post.createdAt.toLocaleDateString("th-TH", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}</span>
					) : (
						<span>No date available</span>
					)}
				</div>
				<span className="text-2xl font-bold">{post.title}</span>
			</header>
			<section className="flex flex-col gap-[15px]">
				<Tag tagName={postTypeToLabelPost(post.type)} color={postTypeToColorMap(post.type)} />
				<p className="break-all font-light">{post.content}</p>
				<div className="flex gap-2">
					<LikeButton isLike={isLike} like={like} unlike={unlike} postId={post.id} type="post" />
					<FiSend className="h-5 w-5" />
				</div>
				{likeCount > 0 && <p className="font-light text-sm">{likeCount} likes</p>}
				<CommentInput type={"post"} postId={post.id} />
			</section>
		</div>
	);
};

export default PostDetail;
