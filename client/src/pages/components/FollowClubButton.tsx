import axios from "axios";
import { useState } from "react";
import { Club, ClubMember } from '../../types/club';
import { useAuth } from "../../hooks/useAuth";

type FollowClubButtonProps = {
	member: ClubMember | undefined
	club: Club
    clubId: number;
    isFollowing: boolean;
	editing: boolean;
  	setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  	updateClub: () => void;
  	setEditedFields: React.Dispatch<React.SetStateAction<Partial<Club>>>;
};

export default function FollowClubButton({ member, club, clubId, isFollowing, editing, setEditing, updateClub, setEditedFields }: FollowClubButtonProps) {
  const { user } = useAuth();
	const [showModal, setShowModal] = useState(false);

	async function handleClick() {
		if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}
		const status = isFollowing ? "unfollow" : "follow";
		try {
			const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
			if (response.status === 200) {
				await axios.post(`http://localhost:3001/clubs/${clubId}/follow?status=${status}`, {
					userId: response.data.id,
				});
				window.location.reload();
			} else {
        console.error('Failed to fetch user id');
      }
		} catch (error) {
			console.error(error);
		}
	}

	const handleEditClick = () => {
		setEditing(!editing)
		setShowModal(false)

		if (!editing && club) {
			setEditedFields({
			  category: club.category || '',
			  location: club.location || '',
			  phoneNumber: club.phoneNumber || '',
			  socialMedia: {
				facebook: club.socialMedia?.facebook || '',
				instagram: club.socialMedia?.instagram || '',
				twitter: club.socialMedia?.twitter || '',
			  }
			});
		}
	}

	const confirmUpdate = () => {
		updateClub()
		setShowModal(false)
	}

	if (member?.role === 'PRESIDENT' || member?.role === 'VICE_PRESIDENT') {
		return (
			<>
				{editing ? 
					<button
						className="text-sm py-1 px-4 border rounded-full"
						onClick={() => setShowModal(true)}
					>
						บันทึก
					</button> :
					<button
						className="text-sm py-1 px-4 border rounded-full"
						onClick={handleEditClick}
					>
						แก้ไข
					</button> 
				}
				{editing && 
					<button
						className="text-sm py-1 px-4 rounded-full bg-[#F24B4B]"
						onClick={handleEditClick}
					>
						ยกเลิก
					</button>
				}
				{showModal && (
					<>
						<div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
							<div className="relative w-auto my-6 mx-auto max-w-3xl">
								<div className="border-0 rounded-lg shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] relative flex flex-col w-full bg-white outline-none focus:outline-none">
									<div className="flex justify-between p-[25px] flex-col text-black gap-[15px]">
										<p>ยืนยันการเปลี่ยนแปลง</p>
										<div className="flex gap-[10px]">
											<button 
												className="text-sm py-1 px-4 rounded-full bg-[#006664] text-white"
												onClick={confirmUpdate}
											>
												ตกลง
											</button>
											<button 
												className="text-sm py-1 px-4 rounded-full border border-[#006664] text-[#006664]"
												onClick={()=>setShowModal(false)}
											>
												แก้ไขเพิ่มเติม
											</button>
										</div>
										
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</>
			
		);
	}

	return (
		<button
			className="text-sm py-1 px-4 border rounded-full"
			onClick={handleClick}
		>
			{isFollowing ? "เลิกติดตาม" : "ติดตาม"}
		</button>
	);
}