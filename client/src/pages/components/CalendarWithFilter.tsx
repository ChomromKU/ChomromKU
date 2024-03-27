import React, { useEffect, useState } from "react";
import SelectWrapper from "./SelectWrapper";
import CalendarWrapper, { CalendarWrapperProps } from "./CalendarWrapper";
import { Club } from "../../types/club";
import { User } from "../../types/auth"
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";
import axios from "axios";
import FollowFilter from "./FollowFilter";

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
	const [authUserId, setAuthUserId] = useState<number>(0);
	const [campus, setCampus] = useState("บางเขน");
	const [filterFollowings, setFilterFollowings] = useState({ club: false, event: false });
	const [fitleredEvents, setFilteredEvents] = useState(events);
	console.log(user);

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
          setAuthUserId(fetchedUserId); 
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
					return e.followers.map(f => f.id).includes(user.id);
				});
			}
			if (filterFollowings.club) {
				const subscribersId = clubs
					.map((c) => c.subscribers)
					.flat()
					.map((s) => s.id);
				filtered = filtered.filter((_) => subscribersId.includes(user.id));
			}
		}
		filtered = filtered.filter((e) => getThaiBranch(e.club.branch) === campus);
		setFilteredEvents(filtered);
		return () => {};
	}, [id, user?.stdId, authUserId,campus, filterFollowings]);

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

