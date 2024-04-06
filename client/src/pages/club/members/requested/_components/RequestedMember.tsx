import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { User } from "../../../../../types/auth";



interface RequestedMember {
    id: number;
    year: string;
    faculty: string;
    department: string;
    email: string;
    phone: string;
    reason: string;
    userId: number;
    clubId: number;
}

interface RequestedMemberProb {
    clubLabel: string
}

const RequestedMember: React.FC<RequestedMemberProb> = ({ clubLabel }) => {
    const {id} = useParams()
    const navigate = useNavigate();
    const [openedAccept, { open: openAccept, close: closeAccept }] = useDisclosure(false);
    const [openedDecline, { open: openDecline, close: closeDecline }] = useDisclosure(false);
    const [requestedData, setRequestedData] = useState<RequestedMember[] | null>(null);
    const [userData, setUserData] = useState<User[] | null>(null);

    const [sending, setSending] = useState<boolean>(false)
	const [successModalOpened, setSuccessModalOpened] = useState(false);

    const openSuccessModal = () => {
		setSuccessModalOpened(true);
	};
	const closeSuccessModal = () => {
		setSuccessModalOpened(false);
	};

    const fetchRequestedMembers = async () => {
        try {
          const { data } = await axios.get<RequestedMember[]>(`http://localhost:3001/clubs/${id}/requestedMember`);
          setRequestedData(data);
        } catch (error) {
          console.error('Error fetching Requested Members:', error);
        }
      };
  
    const fetchUserData = async () => {
        try {
          const { data } = await axios.get<User[]>(`http://localhost:3001/users`);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching User Data:', error);
        }
    };

    const deleteMember = async (id: number, userId: number) => {
        try {
            await axios.delete(`http://localhost:3001/clubs/${id}/user/${userId}/applyForm`);
            fetchRequestedMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const onDeletes = async (id: number, userId: number) => {
		try {
            console.log('sending');
            setSending(true)
            deleteMember(id, userId)
            closeDecline()
            openSuccessModal();
            setTimeout(() => {
                setSending(false)
            }, 3000);
		} catch (error) {
		console.error(error);
		}
	};

    const onSubmit = async (data: RequestedMember) => {
		try {
            console.log('sending');
            setSending(true)
            await axios.put(`http://localhost:3001/clubs/${id}/members`, data);
            deleteMember(data.clubId, data.userId)
            closeAccept()
            openSuccessModal();
            setTimeout(() => {
                setSending(false)
            }, 3000);
		} catch (error) {
		console.error(error);
		}
	};

    useEffect(() => {
      fetchRequestedMembers();
      fetchUserData();
    }, []);
  
    if (!requestedData || !userData) {
      return (
        <p>Loading...</p>
      );
    }

	return (
		<div className="flex flex-col">
			<div className="px-6 pt-4">
				<span className="text-[#2F3337] text-2xl font-bold">{clubLabel}</span>
			</div>

			<div className="p-[24px] flex flex-col gap-[20px] ">
				<p className="font-bold text-base">ผู้สมัครเข้าชมรมทั้งหมด</p>
				<div className="items-center flex flex-col gap-[20px]">
                    {requestedData.map((member: RequestedMember) => {
                        const user = userData.find(user => user.id === member.userId);
                        if (!user) return <p>can't find user</p>;
                        return (
                            <div key={member.id} className="flex flex-col justify-between p-4 w-full border gap-[10px] border-gray-200 rounded-[20px] shadow-[0_0_20px_-0_rgba(0,0,0,0.1)]">
                                <p className="text-2xl font-bold">{user.firstNameTh} {user.lastNameTh}</p>
                                {/* Render user information */}
                                <div className="flex flex-col gap-[5px]">
                                    <p><span className="font-bold">ชั้นปี</span>: {member.year}</p>
                                    <p><span className="font-bold">คณะ</span>: {member.faculty}</p>
                                    <p><span className="font-bold">สาขา</span>: {member.department}</p>
                                    <p><span className="font-bold">email</span>: {member.email}</p>
                                    <p><span className="font-bold">เบอร์โทรศัพท์</span>: {member.phone}</p>
                                    <p className="leading-[25px]"><span className="font-bold">เหตุผลที่อยากเข้าชมรม</span>: {member.reason}</p>
                                    </div>
                                    <div className="flex flex-row">
                                    <button
                                        onClick={openAccept}
                                        className="block text-sm text-white py-[4px] px-[15px] mr-[5px] bg-[#006664] rounded-full"
                                    >
                                        เพิ่มสมาชิก
                                    </button>
                                    <button
                                        onClick={openDecline}
                                        className="block text-sm text-[#F24B4B] py-[4px] px-[15px] border border-[#F24B4B] rounded-full"
                                    >
                                        ปฏิเสธ
                                    </button>
                                </div>
                                <Modal centered opened={openedAccept} onClose={closeAccept} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${openedAccept && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
                                    { sending ? <p>กำลังส่งข้อมูล</p>:
                                        <>
                                            <p className="font-light mb-2">
                                                คุณตกลงรับ <span className="font-bold text-[#006664]">{user.firstNameTh} {user.lastNameTh}</span>
                                                <span> เป็นสมาชิกชมรมใช่หรือไม่</span>
                                            </p>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
                                                    className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
                                                    onClick={() => onSubmit(member)}
                                                >
                                                    ตกลง
                                                </button>
                                                <button
                                                    onClick={closeAccept}
                                                    className="py-2 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
                                                >
                                                    ยกเลิก
                                                </button>
                                            </div>
                                        </>
                                    }
                                </Modal>
                                <Modal centered opened={openedDecline} onClose={closeDecline} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${openedDecline && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
                                    { sending ? <p>กำลังลบข้อมูล</p>:
                                        <>
                                            <p className="font-light mb-2">
                                                คุณปฎิเสธ <span className="font-bold text-[#006664]">{user.firstNameTh} {user.lastNameTh}</span>
                                                <span> เป็นสมาชิกชมรมใช่หรือไม่</span>
                                            </p>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
                                                    className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
                                                    onClick={() => onDeletes(member.clubId, member.userId)}
                                                >
                                                    ตกลง
                                                </button>
                                                <button
                                                    onClick={closeDecline}
                                                    className="py-2 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
                                                >
                                                    ยกเลิก
                                                </button>
                                            </div>
                                        </>
                                    }
                                </Modal>
                                <Modal
                                    centered
                                    opened={successModalOpened}
                                    onClose={closeSuccessModal}
                                    withCloseButton={false}
                                    className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${successModalOpened && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}
                                >
                                    <p>สำเร็จ</p>
                                </Modal>
                            </div>
                        );
                    })}
				</div>
			</div>
		</div>
	);
};

export default RequestedMember;