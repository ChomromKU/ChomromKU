import React, { useEffect, useState } from "react";
import MemberBox from "../../components/MemberBox";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ClubMember } from "../../../types/club";

// interface MembersPageProps {
//   params: { id: string };
// }

interface MembersComponentProps {
  clubId: string;
  name: string;
  role: string;
}


const MembersComponent: React.FC<MembersComponentProps> = ({ clubId, name, role }) => {
  const [members, setMembers] = useState<ClubMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/clubs/${clubId}/members`);
        if (response.status === 200) {
          setMembers(response.data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
  
    fetchMembers();
  
  }, [clubId]);

  return (
    <div className="flex flex-col gap-[20px]">
      <p>{name}</p>
      {members.length > 0 ? (
        members.map((member) => (
          <>
            {role === member.role && (
              <MemberBox
                key={member.id}
                name={`${member?.user?.titleTh} ${member?.user?.firstNameTh} ${member?.user?.lastNameTh}`}
              />
            )}
          </>
        ))
      ) : (
        <MemberBox name="ไม่พบสมาชิกในตำแหน่งนี้" />
      )}
    </div>
  );
};

const Members: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // console.log("Club ID:", id);

    if (!id) {
      return <div>No club ID found</div>;
    }
  
    const membersComponentInputs: MembersComponentProps[] = [
      { clubId: id, name: "หัวหน้า" , role: 'PRESIDENT' },
      { clubId: id, name: "รองหัวหน้า", role: 'VICE_PRESIDENT' },
      { clubId: id, name: "Admin", role: 'ADMIN' },
      { clubId: id, name: "สมาชิกทั่วไป", role: 'NORMAL'}
    ];
  
    return (
      <div className="p-[24px]  flex flex-col gap-[20px]">
        <h1 className="text-[24px] font-bold">ชมรมดนตรีสากลมหาวิทยาลยเกษตรศาสตร์ (เค ยู แบนด์)</h1>
        <p className="font-bold">สมาชิกทั้งหมด</p>
        {membersComponentInputs.map((input, index) => (
          <MembersComponent
              clubId={input.clubId}
              name={input.name}
              role={input.role}
              key={index}
          />
        ))}
      </div>
    );
  };

export default Members;
