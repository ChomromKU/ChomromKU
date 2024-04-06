import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Events } from '../../types/post';
import searchIcon from "../../images/search.svg";

interface Props {
  events: Events[];
  placeholder: string;
}

const SearchEvents: React.FC<Props> = ({ events, placeholder }) => {
  const [query, setQuery] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<Events[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const handleSearch = () => {
    const searchEvents = events.filter((event) =>
      event.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEvents(searchEvents);
  };

  const handleEventClick = (index: number) => {
    setSelectedEvent(index === selectedEvent ? null : index);
  };

  return (
    <div className="relative">
      <div className="flex items-center relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-gray-500 pr-10"
        />
        <button
          onClick={handleSearch}
          className="absolute right-0 top-0 h-full px-3 flex items-center"
        >
          <img src={searchIcon} alt="" width={16} height={16} />
        </button>
      </div>
      <div className="mt-4">
        {filteredEvents.map((event, index) => (
          <Link
            key={index}
            to={`/events/${event.id}`}
            className={`flex flex-col md:flex-row gap-4 mb-2 p-2 border border-gray-300 rounded-[20px] ${
              index === selectedEvent ? 'bg-grey-500' : ''
            } hover:bg-gray-100 hover:border-gray-400`}
            onClick={() => handleEventClick(index)}
          >
            <div className="flex flex-1">
              <div className="flex flex-col flex-1">
                <div className="font-bold">{event.title}</div>
                <p className="text-gray-400 text-sm">{event.club.label}</p>
                <div className="flex items-center text-gray-400">
                  <span className="mr-1 text-sm">{dayjs(event.startDate).format('DD/MM/YYYY')}</span>
                  <span>-</span>
                  <span className="ml-1 text-sm">{dayjs(event.endDate).format('DD/MM/YYYY')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchEvents;
