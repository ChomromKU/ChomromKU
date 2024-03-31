import { useEffect, useState } from "react";
import axios from "axios";
import AutocompleteWrapper from './components/AutocompleteWrapper';
import CalendarWithFilter from './calendar/CalendarWithFilter';
import News from './components/NewsPost';
import { Events, Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { Club } from "../types/club";

function Main() {
  const [events, setEvents] = useState<Events[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, clubsResponse, postsResponse] = await Promise.all([
          axios.get('http://localhost:3001/events'),
          axios.get('http://localhost:3001/clubs'),
          axios.get('http://localhost:3001/posts?limit=10')
        ]);
        if (eventsResponse.status === 200) {
          const fetchedEvents: Events[] = eventsResponse.data;
          setEvents(fetchedEvents);
        } else {
          console.error('Failed to fetch events');
        }
        if (clubsResponse.status === 200) {
          const fetchedClubs: Club[] = clubsResponse.data;
          setClubs(fetchedClubs);
        } else {
          console.error('Failed to fetch clubs');
        }
        if (postsResponse.status === 200) {
          const fetchedPosts: Post[] = postsResponse.data;
          setPosts(fetchedPosts);
          console.log(fetchedPosts);
        } else {
          console.error('Failed to fetch posts');
        }
        setLoading(false); 
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); 
      }
    };
    fetchData();
    console.log(posts);
  }, []);
  

  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
      <AutocompleteWrapper data={[]} />
      <h1 className="self-start text-2xl font-bold">ตารางอีเว้นท์และกิจกรรม</h1>
      <CalendarWithFilter events={events} user={user} clubs={clubs} />
      <h1 className="self-start text-2xl font-bold">โพสต์</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        posts.map((p) => <News post={p} key={p.id} />)
      )}
    </div>
  );
}

export default Main;