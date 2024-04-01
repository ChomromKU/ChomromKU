import React, { useEffect, useState } from "react";
import axios from "axios";
import SelectWrapper from "./_components/SelectWrapper";
import CalendarWrapper, { CalendarWrapperProps } from "./_components/CalendarWrapper";
import FollowFilter from "./_components/FollowFilter";
import { Club } from "../../types/club";
import { User } from "../../types/auth"
import { useAuth } from "../../hooks/useAuth";


interface ClubWithSubscriber extends Club {
	subscribers: User[];
}

interface CalendarWithFilterProps extends CalendarWrapperProps {
	user: User | null;
	clubs: ClubWithSubscriber[];
}

const CalendarWithFilter: React.FC<CalendarWithFilterProps> = ({ events, clubs }) => {
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
			case "SakonNakorn":
				return "วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร";
			case "Sriracha":
				return "ศรีราชา";
		}
	};

	useEffect(() => {
			if (!events.length) {
				return; 
			}
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
			let filtered = events;
			if (filterFollowings.event) {
				filtered = filtered.filter(e => {
					return e.followers && Array.isArray(e.followers) && e.followers.map(f => f.id).includes(userId);
				});
			}
			if (filterFollowings.club) {
				const subscribersId = clubs
					.map((c) => c.subscribers)
					.flat()
					.map((s) => s.id);
				filtered = filtered.filter((_) => subscribersId.includes(userId));
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
	}, [campus, filterFollowings, events]);

	return (
		<>
			<div className="w-full flex items-start gap-2">
				<SelectWrapper value={campus} setValue={setCampus} />
				{user ? (
					<>
						<FollowFilter followingCheck={filterFollowings} setFollowingCheck={setFilterFollowings} />
					</>
				) : (
					null
				)}
			</div>
			<CalendarWrapper events={fitleredEvents} />
		</>
	);
};

export default CalendarWithFilter;

