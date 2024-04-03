import { useEffect, useState } from "react";
import Tag from "../../components/Tag";
import { Post } from "../../../types/post"
import { FiSend } from "react-icons/fi";
import { postTypeToColorMap, postTypeToLabelPost } from "../../../lib/post"
import CommentInput from "../../components/CommentInput";
import LikeButton from "../../components/LikeButton";
import { useAuth } from "../../../hooks/useAuth";
import { useParams } from "react-router-dom";
import axios from "axios";

type PostDetailProps = {
	post: Post;
};

const PostDetail = ({ post }: PostDetailProps) => {
	const { user } = useAuth();
	const { id } = useParams< {id?: string}>();
	const [userId, setUserId] = useState<number>(0);
	const [likeCount, setLikeCount] = useState<number>(
		post?.likes?.length !== undefined ? post.likes.length : 0
	);	
	const [isLike, setIsLike] = useState<boolean>(
		user && post && post.likes ? post.likes.some((like) => like.userId === userId) : false
	);

	useEffect(() => {
		const fetchIsLike = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
          if (response.status === 200) {
            setIsLike(post.likes.some((like) => like.userId === response.data.id));
          } else {
            setIsLike(false);
          }
        } catch (error) {
          setIsLike(false);
        }
      }
    };
    fetchIsLike();
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
				<div className="flex justify-between font-light text-sm my-[10px]">
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
						<span>ไม่ระบุเวลาที่โพส</span>
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
