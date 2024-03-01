import AutocompleteWrapper from '../page/components/AutocompleteWrapper';
import CalendarWrapper from '../page/components/CalendarWrapper'
import News from '../page/components/News';
import Clubs from '../page/club';

function Main() {
  const posts = [{
    id: 1,
    club: 'Sample Club',
    owner: 'John Doe',
    likes: 10,
    content: 'Lorem ipsum dolor sit amet.',
    type: 'NORMAL_POST'
  }, 
  {
    id: 2,
    club: 'Sample Club',
    owner: 'John Doe',
    likes: 5,
    content: 'Lorem ipsum dolor sit amet.',
    type: 'QA'
  },
];
  return (
    // <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
    <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
      <AutocompleteWrapper data={[]} />
      {/* <Clubs searchParams={{ q: "" }} /> */}
      <h1 className="self-start text-2xl font-bold">ตารางอีเว้นท์และกิจกรรม</h1>
      <CalendarWrapper events={[]}/>
      <h1 className="self-start text-2xl font-bold">โพสต์</h1>
      {posts.map((p) => (
				<News post={p} key={p.id} />
			))}
    </div>
  );
}

export default Main;
