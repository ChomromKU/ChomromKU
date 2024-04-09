import axios from 'axios';
import { useEffect, useState } from "react";
import { Club } from "../../types/club";
import Search from "../components/Search";
import ClubBox from "../components/ClubBox";


export default function Clubs() {
	const [clubs, setClubs] = useState<Club[]>([]);
	const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);

	useEffect(() => {
		const fetchClubs = async () => {
			try {
				const { data } = await axios.get('http://localhost:3001/clubs');
				setClubs(data);
				setFilteredClubs(data);
			} catch (error) {
				console.error('Error fetching clubs:', error);
			}
		};
	
		fetchClubs();
	}, []);
	
	return (
		<div className="p-[24px] flex flex-col gap-[20px] w-full">
			<h1 data-testid="clubs" className="text-2xl font-bold">ชมรมทั้งหมด</h1>
			<Search
				data-testid="club-search-bar"
				type="clubs"
				placeholder="ค้นหาชมรม"
				onSearch={(query) => {
					const searchClubs = clubs.filter((club) =>
						club.label.toLowerCase().includes((query || "").toLowerCase())
					);
					setFilteredClubs(searchClubs)
				}}
			/>
			<p data-testid="bangkhen-branch" className="font-bold">วิทยาเขตบางเขน</p>
			{filteredClubs
				.filter((club) => club.branch === "Bangkhen")
				.map((club) => (
					<ClubBox clubId={club.id} clubName={club.label} key={club.id} />
				))}
			<p data-testid="kamphaengsaen-branch" className="font-bold">วิทยาเขตกำแพงแสน</p>
			{filteredClubs
				.filter((club) => club.branch === "KamphaengSaen")
				.map((club) => (
					<ClubBox clubId={club.id} clubName={club.label} key={club.id} />
				))}
			<p data-testid="sakonnakorn-branch" className="font-bold">วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
			{filteredClubs
				.filter((club) => club.branch === "SakonNakorn")
				.map((club) => (
					<ClubBox clubId={club.id} clubName={club.label} key={club.id} />
				))}
			<p data-testid="sriracha-branch" className="font-bold">วิทยาเขตศรีราชา</p>
			{filteredClubs
				.filter((club) => club.branch === "Sriracha")
				.map((club) => (
					<ClubBox clubId={club.id} clubName={club.label} key={club.id} />
				))}
			{/* <p>{JSON.stringify(clubs)}</p> */}
		</div>
	);
}