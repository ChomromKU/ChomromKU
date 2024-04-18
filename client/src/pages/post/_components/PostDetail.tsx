import React, { useEffect, useState } from "react";
import Tag from "../../components/Tag";
import { Post } from "../../../types/post"
import { postTypeToColorMap, postTypeToLabelPost, getPostTypeEnumValue } from "../../../lib/post"
import CommentInput from "../../components/CommentInput";
import LikeButton from "../../components/LikeButton";
import ShareButton from "../../components/ShareButton";
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
            setUserId(response.data.id);
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
    <div className="w-full flex flex-col gap-[15px]">
      <header>
        <div className="flex justify-between font-light text-[12px] mb-[15px]">
          <p>
            โดย {post.owner.firstNameTh} {post.owner.lastNameTh}
          </p>
          {post.createdAt ? (
            <p>{(new Date(post.createdAt)).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          ) : (
            <p>ไม่ระบุเวลาที่โพส</p>
          )}
        </div>
        <p data-testid="post-title" className="text-2xl font-bold">{post.title}</p>
      </header>
      <section className="flex flex-col gap-[15px]">
        <Tag tagName={postTypeToLabelPost(getPostTypeEnumValue(post.type as unknown as string))}
            color={postTypeToColorMap(getPostTypeEnumValue(post.type as unknown as string))} 
        />
        <p data-testid="post-content" className="break-all font-light">{post.content}</p>
        <div className="flex gap-2">
          <LikeButton isLike={isLike} like={like} unlike={unlike} postId={post.id} type="post" />
          <ShareButton />
        </div>
        {likeCount > 0 && <p className="font-light text-sm">{likeCount} likes</p>}
        <CommentInput type={"post"} postId={post.id} />
      </section>
    </div>
  );
};

export default PostDetail;
