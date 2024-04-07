import React, { useEffect, useState } from "react";
import axios from "axios";
import minus from "../../images/minus_1.png";
import plus from "../../images/plus_1.png";
import { useParams } from 'react-router-dom';
import { User } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type MemberBoxProps = {
  name: string;
  role?: string;
  memberId?: number;
  userRole?: string;
};

const MemberBox: React.FC<MemberBoxProps> = ({ name, role, memberId, userRole }) => {
  const { id } = useParams();
  const [openedAccept, { open: openAccept, close: closeAccept }] = useDisclosure(false);
  const [openedDecline, { open: openDecline, close: closeDecline }] = useDisclosure(false);
  const [sending, setSending] = useState<boolean>(false)
  const [successModalOpened, setSuccessModalOpened] = useState(false);

  const openSuccessModal = () => {
	  setSuccessModalOpened(true);
  };
  const closeSuccessModal = () => {
	  setSuccessModalOpened(false);
  };


  const handlePlusClick = async () => {
    try {
		
      await axios.put(`http://localhost:3001/clubs/${id}/members/${memberId}/role`, {
        role: "ADMIN",
      });
	window.location.reload()
      // Assuming you want to refresh the member list after updating the role
      // You may need to implement state management to refresh the list
	//   window.location.reload()
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleMinusClick = async () => {
    try {
      await axios.put(`http://localhost:3001/clubs/${id}/members/${memberId}/role`, {
        role: "NORMAL",
      });
	window.location.reload()
      // Assuming you want to refresh the member list after updating the role
      // You may need to implement state management to refresh the list
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };


  return (
    <div className="border rounded-[20px] p-[15px]" style={{ boxShadow: "0px 0px 20px 0px rgba(0, 0, 0, 0.10)" }}>
    {userRole === "PRESIDENT" || userRole === "VICE_PRESIDENT" ? (
        <div className="flex">
          <p className="w-fit">{name}</p>
          {role === "ADMIN" && (
              <button className="ml-auto" onClick={openDecline}>
                <img width={16} src={minus} alt="Minus" />
              </button>
            )}
            {role === "NORMAL" && (
              <button className="ml-auto" onClick={openAccept}>
                <img width={16} src={plus} alt="Plus" />
              </button>
            )}
        </div>)
    :
      <p>
        {name}
      </p>
    }

	  <Modal centered opened={openedAccept} onClose={closeAccept} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${openedAccept && 'p-[15px]'} rounded-[20px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
                                    { sending ? <p>กำลังส่งข้อมูล</p>:
                                        <>
                                            <p className="font-light mb-2">
                                                {/* คุณตั้งให้ <span className="font-bold text-[#006664]">{member.firstNameTh} {user.lastNameTh}</span> */}
                                                <span> เป็นแอดมินใช่หรือไม่</span>
                                            </p>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
													type="button"
                                                    className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
                                                    onClick={handlePlusClick}
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
                                                {/* คุณตั้งให้ <span className="font-bold text-[#006664]">{user.firstNameTh} {user.lastNameTh}</span> */}
                                                <span> เป็นสมาชิกชมรมทั่วไปใช่หรือไม่</span>
                                            </p>
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
													type="button"
                                                    className="py-[4px] px-[15px] rounded-full bg-[#006664] text-white"
                                                    onClick={handleMinusClick}
													
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
};

export default MemberBox;