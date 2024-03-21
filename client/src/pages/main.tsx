import AutocompleteWrapper from './components/AutocompleteWrapper';
import CalendarWrapper from './components/CalendarWrapper'
import News from './components/News';
import { PostType } from '../types/post';
// import { SocialMedia } from '../types/club';

function Main() {
  const posts = [{
    id: 1,
    title: 'Sample Title 1',
    type: PostType.NORMAL_POST,
    content: 'Lorem ipsum dolor sit amet 1.',
    imageUrl: 'some-url-1',
    approved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    comments: [],
    club: { id: 1, label: 'Sample Club', branch: 'Some Branch', category: 'Some Category', location: 'Some Location', phoneNumber: '1234567890', socialMedia: {facebook: '', instagram: '', twitter: ''} },
    clubId: 1,
    SocialMedia: { facebook: 'test',intagram: 'test',twitter: 'test'},
    owner: {
		id: 1,
		stdId: "1234567890",
		stdCode: "ABC123",
		titleTh: "นาย",
		titleEn: "Mr.",
		firstNameTh: "ชื่อไทย",
		lastNameTh: "นามสกุลไทย",
		firstNameEn: "First Name",
		lastNameEn: "Last Name",
		campusNameTh: "ชื่อวิทยาลัย (ไทย)",
		campusNameEn: "College Name (English)",
	  },
    ownerId: 1,
}, 
{
    id: 2,
    title: 'Sample Title 2',
    type: PostType.NORMAL_POST,
    content: 'Lorem ipsum dolor sit amet 2.',
    imageUrl: 'some-url-2',
    approved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    comments: [],
    club: { id: 2, label: 'Sample Club 2', branch: 'Some Branch 2', category: 'Some Category 2', location: 'Some Location 2', phoneNumber: '9876543210',  socialMedia: {facebook: '', instagram: '', twitter: ''} },
    clubId: 2,
    SocialMedia: { facebook: 'test',intagram: 'test',twitter: 'test'},
    owner: {
		id: 1,
		stdId: "1234567890",
		stdCode: "ABC123",
		titleTh: "นาย",
		titleEn: "Mr.",
		firstNameTh: "ชื่อไทย",
		lastNameTh: "นามสกุลไทย",
		firstNameEn: "First Name",
		lastNameEn: "Last Name",
		campusNameTh: "ชื่อวิทยาลัย (ไทย)",
		campusNameEn: "College Name (English)",
	  },
    ownerId: 2,
}];

  return (
    // <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
    <div className="flex min-h-screen flex-col items-center p-[24px] bg-white gap-[20px]">
      <AutocompleteWrapper data={[]} />
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
