import { useEffect, useState } from 'react';
import PostDetail from '../components/PostDetail';
import { Post } from '../../types/post';
import CarouselWrapper from './_components/CarouselWrapper';
import CommentBox from '../components/CommentBox';
import { useAuth } from '../../hooks/useAuth';
import News from '../components/NewsPost';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Comment {
  id: number;
  message: string;
  createdAt: Date;
  userId: number; // Assuming userId is sent from the server
  user: {
    id: number;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
  };
}

const PostDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    const fetchPostAndClub = async () => {
			if (id) {
				try {
					const response = await axios.get(`http://localhost:3001/posts/${id}`);
					if (response.status === 200) {
						setPost(response.data);
					} else {
						console.log('Failed to fetch post');
					};
					if (post) {
						const response = await axios.get(`http://localhost:3001/clubs/${id}`);
						if (response.status === 200) {
							setClub(response.data);
							console.log('succes fetch club')
						} else {
							console.log('Failed to fetch club');
						};
					};
				} catch (error) {
					console.error('Error fetching data:', error);
				}
    	};
		};
    fetchPostAndClub();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsResponse = await axios.get(`http://localhost:3001/posts/${id}/comment`);
        if (commentsResponse.status === 200) {
          setComments(commentsResponse.data);
        } else {
          console.log('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [id]);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white">
      <div className="h-fit w-full relative">
        <CarouselWrapper post={post} />
        <div className="absolute w-full -bottom-5 p-3 font-bold bg-[#006664] text-white rounded-t-xl">
          {post.club.label}
        </div>
      </div>
      <PostDetail post={post} />
      <div className="w-full px-[24px] pb-[24px] flex flex-col gap-[15px]">
        {comments.map((c) => (
          <CommentBox
            name={`${c.user.firstNameTh} ${c.user.lastNameTh}`}
            message={c.message}
            createdAt={c.createdAt}
            isYou={user ? user.id === c.userId : false} // Check if the current user is the commenter
            firstChar={c.user.firstNameEn.substring(0, 1)}
            key={c.id}
          />
        ))}
      </div>
      <p className="font-bold text-[24px] w-full px-8 mb-2">โพสต์ต่างๆจากชมรม</p>
      <div className="w-full px-8 flex flex-col gap-4">
        {club?.posts.map((p: Post) => (
          <News post={p} key={p.id} />
        ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
