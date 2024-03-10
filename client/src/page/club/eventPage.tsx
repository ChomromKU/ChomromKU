import { useEffect, useState } from 'react';
import EventBox from '../components/EventBox';
import { useParams, Link } from 'react-router-dom'; // Import useParams hook

interface Event {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
}

interface MembersComponentProps {
  clubId: string;
  status: string;
}

const EventComponent: React.FC<MembersComponentProps> = ({ clubId, status }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events from your backend API
        const response = await fetch(`http://localhost:3001/events?clubId=${clubId}&status=${status}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [clubId, status]);

//   const currentDate = new Date();
//   const presentEvents = events.filter(event => new Date(event.startDate) <= currentDate && currentDate <= new Date(event.endDate));
//   const upcomingEvents = events.filter(event => new Date(event.startDate) > currentDate);
//   const pastEvents = events.filter(event => new Date(event.endDate) < currentDate);

    const currentDate = new Date().getTime();
    const presentEvents = events.filter(event => {
        const startDate = new Date(event.startDate).getTime();
        const endDate = new Date(event.endDate).getTime();
        return startDate <= currentDate && currentDate <= endDate;
    });
    const upcomingEvents = events.filter(event => {
        const startDate = new Date(event.startDate).getTime();
        return startDate > currentDate;
    });
    const pastEvents = events.filter(event => {
        const endDate = new Date(event.endDate).getTime();
        return endDate < currentDate;
    });

  return (
    <div className="flex flex-col gap-[20px]">
      <p>{status}</p>
      {events.length > 0 && (
        <>
          {status === 'กิจกรรมที่กำลังจัดตอนนี้' && presentEvents.length > 0 && (
            <div className="flex flex-col gap-[20px] border-[2px] border-[#28C3D7] rounded-[20px]">
              {presentEvents.map(event => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <EventBox
                    eventName={event.title}
                    link="/"
                    startDate={new Date(event.startDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    endDate={new Date(event.endDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    location={event.location}
                  />
                </Link>
              ))}
            </div>
          )}

          {status === 'กิจกรรมที่กำลังจะเกิดขึ้น' && upcomingEvents.length > 0 && (
            <div className="flex flex-col gap-[20px] border-[2px] border-[#28C3D7] rounded-[20px]">
              {upcomingEvents.map(event => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <EventBox
                    eventName={event.title}
                    link="/"
                    startDate={new Date(event.startDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    endDate={new Date(event.endDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    location={event.location}
                  />
                </Link>
              ))}
            </div>
          )}

          {status === 'กิจกรรมที่ผ่านมา' && pastEvents.length > 0 && (
            <div className="flex flex-col gap-[20px] border-[2px] border-[#28C3D7] rounded-[20px]">
              {pastEvents.map(event => (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <EventBox
                    eventName={event.title}
                    link="/"
                    startDate={new Date(event.startDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    endDate={new Date(event.endDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    location={event.location}
                  />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Members: React.FC = () => {
    const { id } = useParams<{ id?: string }>(); // Make id optional in case it's undefined
  
    if (!id) {
      // Handle the case when id is not present in the URL
      return <div>No club ID found</div>;
    }
  
    const membersComponentInputs: MembersComponentProps[] = [
      { clubId: id, status: 'กิจกรรมที่กำลังจัดตอนนี้' },
      { clubId: id, status: 'กิจกรรมที่กำลังจะเกิดขึ้น' },
      { clubId: id, status: 'กิจกรรมที่ผ่านมา' }
    ];
  
    return (
      <div className="p-[24px]  flex flex-col gap-[20px]">
        <h1 className="text-[24px] font-bold">ชมรมดนตรีสากลมหาวิทยาลัยเกษตรศาสตร์ (เค ยู แบนด์)</h1>
        <p className="font-bold">กิจกรรมทั้งหมด</p>
  
        {membersComponentInputs.map(input => (
          <EventComponent clubId={input.clubId} status={input.status} key={input.status} />
        ))}
      </div>
    );
  };
  

export default Members;
