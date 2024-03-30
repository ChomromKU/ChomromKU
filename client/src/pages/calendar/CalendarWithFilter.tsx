import React, { useEffect, useState } from "react";
import axios from "axios";
import SelectWrapper from "./_components/SelectWrapper";
import CalendarWrapper, { CalendarWrapperProps } from "./_components/CalendarWrapper";
import FollowFilter from "./_components/FollowFilter";
import { Club } from "../../types/club";
import { User } from "../../types/auth"
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";


interface ClubWithSubscriber extends Club {
	subscribers: User[];
}

interface CalendarWithFilterProps extends CalendarWrapperProps {
	user: User | null;
	clubs: ClubWithSubscriber[];
}

const CalendarWithFilter: React.FC<CalendarWithFilterProps> = ({ events, clubs }) => {
	const { id } = useParams();
	const { user } = useAuth();
	const [userId, setUserId] = useState<number>(0);
	const [campus, setCampus] = useState<string>("บางเขน");
	const [filterFollowings, setFilterFollowings] = useState({ club: false, event: false });
	const [fitleredEvents, setFilteredEvents] = useState(events);

	const getThaiBranch = (branch: String) => {
		switch (branch) {
			case "Bangkhen":
				return "บางเขน";
			case "KamphaengSaen":
				return "กำแพงแสน";
			case "Sriracha":
				return "ศรีราชา";
		}
	};

	useEffect(() => {
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
    if (user?.stdId) {
      fetchUserId();
    }
		let filtered = events;
		if (user) {
			if (filterFollowings.event) {
				filtered = filtered.filter(e => {
					return e.followers && Array.isArray(e.followers) && e.followers.map(f => f.id).includes(userId);
				});
			}
			if (filterFollowings.club) {
				const subscribersId = clubs
					.map((c) => c.subscribers)
					.flat()
					.filter((s) => s && s.id) // Filter out undefined/null values
					.map((s) => s.id);
				filtered = filtered.filter((_) => subscribersId.includes(userId));
			}
		}
		filtered = filtered.filter((e) => {
			const club = e.club;
			if (club && club.branch) {
				return getThaiBranch(club.branch) === campus;
			}
			return false;
		});
		setFilteredEvents(filtered);
		return () => {};
	}, [id, user?.stdId, userId, campus, filterFollowings]);

	return (
		<>
			<div className="w-full flex items-start gap-2">
				<SelectWrapper value={campus} setValue={setCampus} />
				{user ? (
					<>
						<FollowFilter followingCheck={filterFollowings} setFollowingCheck={setFilterFollowings} />
					</>
				) : (
					""
				)}
			</div>
			<CalendarWrapper events={fitleredEvents} />
		</>
	);
};

export default CalendarWithFilter;

