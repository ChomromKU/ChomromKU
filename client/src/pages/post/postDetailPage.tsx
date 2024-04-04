import { useEffect, useState } from 'react';
import PostDetail from './_components/PostDetail';
import { Post } from '../../types/post';
import CarouselWrapper from './_components/CarouselWrapper';
import CommentBox from '../components/CommentBox';
import { useAuth } from '../../hooks/useAuth';
import News from '../components/NewsPost';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Comment } from '../../types/post';

const PostDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const [userId, setUserId] = useState<number>(0);
  const [post, setPost] = useState<Post | null>(null);
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    if (user) {
			const fetchUserId = async () => {
				try {
					const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
					if (response.status === 200) {
						const fetchedUserId = response.data.id;
						setUserId(fetchedUserId); 
					} else {
						console.error('Failed to fetch user id');
					}
				} catch (error) {
					console.error('Error fetching user id:', error);
				}
			};
			fetchUserId();
		}
    const fetchPostAndClub = async () => {
			if (id) {
				try {
					const response = await axios.get(`http://localhost:3001/posts/${id}`);
					if (response.status === 200) {
						setPost(response.data);
            console.log('success fetch post');
					} else {
						console.log('Failed to fetch post');
					};
					const clubResponse = await axios.get(`http://localhost:3001/clubs/${response.data?.clubId}`);
					if (clubResponse.status === 200) {
						setClub(clubResponse.data);
						console.log('success fetch club');
					} else {
						console.log('Failed to fetch club');
					};
				} catch (error) {
					console.error('Error fetching data:', error);
				}
    	};
		};
    fetchPostAndClub();
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white mt-2">
      <div className="h-fit w-full relative">
        <CarouselWrapper post={post} />
        <div className="absolute w-full -bottom-5 p-3 font-bold bg-[#006664] text-white rounded-t-xl">
          {post.club.label}
        </div>
      </div>
      <PostDetail post={post} />
      <div className="w-full px-[24px] pb-[24px] flex flex-col gap-[15px]">
        {post.comments.map((c) => (
          <CommentBox
            name={`${c.user.firstNameTh} ${c.user.lastNameTh}`}
            message={c.message}
            createdAt={c.createdAt}
            isYou={user ? userId === c.userId : false}
            firstChar={c.user.firstNameEn.substring(0, 1)}
            key={c.id}
          />
        ))}
      </div>
      <p className="font-bold text-[24px] w-full px-8 mb-2">โพสต์ต่างๆจากชมรม</p>
      <div className="w-full px-8 flex flex-col gap-4">
        {club?.posts.filter((p: Post) => p.id !== post.id).map((p: Post) => (
        <News post={p} key={p.id} />
        ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
