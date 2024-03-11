import React from "react";
import { Link } from "react-router-dom";

type EventBoxProps = {
    eventName: string,
    link: string,
    startDate: string,
    endDate: string,
    location: string,
    type: string
};

const EventBox: React.FC<EventBoxProps> = ({ eventName, link, startDate, endDate, location, type }) => {
    return (
        <div className={`w-full h-min p-[15px] rounded-[20px] flex flex-col whitespace-nowrap gap-[5px] ${type === 'present' ? 'border-[2px] border-[#28C3D7]' : ''}`} style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.10)' }}>
            <h1 className="text-[24px] font-bold">{eventName}</h1>
            <p>วันเริ่มต้นและสิ้นสุด: {startDate} - {endDate}</p>
            <p className="truncate">สถานที่จัดกิจกรรม: {location}</p>
            <Link to={link}>Go to Event</Link>
        </div>
    );
}

export default EventBox;
