import AutocompleteWrapper from './components/AutocompleteWrapper';
import CalendarWithFilter from './calendar/CalendarWithFilter';
import News from './components/NewsPost';
import { Post, PostType } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Events } from '../types/post';
import { Club } from '../types/club'
import { subscribe } from 'diagnostics_channel';
// import { SocialMedia } from '../types/club';

function Main() {
  const[events, setEvents] = useState<Events[]>([]);
  const[clubs, setClubs] = useState<Club[]>([]);
  const[posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/events');
        if (response.status === 200) {
          const fetchedEvents: Events[] = response.data;
          setEvents(fetchedEvents);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events', error);
      }
    };
    fetchEvents();
    
    const fetchClubs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/clubs');
        if (response.status === 200) {
          const fetchedClubs: Club[] = response.data;
          setClubs(fetchedClubs);
        } else {
          console.error('Failed to fetch clubs');
        }
      } catch (error) {
        console.error('Error fetching clubs', error);
      }
    };
    fetchClubs();

    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/posts?limit=10');
        if (response.status === 200) {
          const fetchedPosts: Post[] = response.data;
          setPosts(fetchedPosts);
        } else {
          console.error('Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts', error);
      }
    };
    fetchPosts();
  }, []);
  
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
      <AutocompleteWrapper data={[]} />
      <h1 className="self-start text-2xl font-bold">ตารางอีเว้นท์และกิจกรรม</h1>
      <CalendarWithFilter events={events} user={user} clubs={clubs} />
      <h1 className="self-start text-2xl font-bold">โพสต์</h1>
      {posts.map((p) => (
				<News post={p} key={p.id} />
			))}
    </div>
  );
}

export default Main;
