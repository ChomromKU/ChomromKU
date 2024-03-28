import React, { useEffect, useState } from "react";
import MemberBox from "../../components/MemberBox";
import axios from "axios";
import { ClubMember } from "../../../types/club";
import { Link, LinkProps, useLocation, useParams } from 'react-router-dom';



interface MembersComponentProps {
  clubId: string;
  name: string;
  role: string;
  userRole?: string;
}

interface CustomLinkProps extends LinkProps {
	state?: {
		clubLabel: string | undefined;
	};
  }
  
  const CustomLink: React.FC<CustomLinkProps> = ({ state, ...rest }) => (
	<Link {...rest} to={rest.to} state={state} />
  );
  

const MembersComponent: React.FC<MembersComponentProps> = ({ clubId, name, role, userRole }) => {
  const [members, setMembers] = useState<ClubMember[]>([]);

  console.log(members)

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
                role={member.role} // Pass the role of the member
                memberId={member.id}
                userRole={userRole}

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
    const location = useLocation();
    const { role, clubLabel } = location.state || {};
    const [showButtons, setShowButtons] = useState(false);

    if (!id) {
      return <div>No club ID found</div>;
    }
  
    const membersComponentInputs: MembersComponentProps[] = [
      { clubId: id, name: "หัวหน้า" , role: 'PRESIDENT' },
      { clubId: id, name: "รองหัวหน้า", role: 'VICE_PRESIDENT' },
      { clubId: id, name: "Admin", role: 'ADMIN' },
      { clubId: id, name: "สมาชิกทั่วไป", role: 'NORMAL'}
    ];

    const handleButtonClick = () => {
      setShowButtons(true);
    };
    
  
    return (
      <div className="p-[24px]  flex flex-col gap-[20px]">
        <h1 className="text-[24px] font-bold">{clubLabel}</h1>
        {(role === 'PRESIDENT' || role === 'VICE_PRESIDENT') && 
          <CustomLink
              to={`/clubs/${id}/requestedMember`}
              state={{ clubLabel: clubLabel }}
              className="text-sm py-1 px-4 rounded-full flex items-center w-fit border text-[#006664] border-[#006664]"
          >
              ผู้สมัครเข้าชมรม
          </CustomLink>
        }
        <p className="font-bold flex items-center">
          สมาชิกทั้งหมด
          {(role === 'PRESIDENT' || role === 'VICE_PRESIDENT') && 
            <button onClick={handleButtonClick} className="text-[12px] font-light ml-auto underline underline-offset-2">
              จัดการสมาชิก
            </button>
          }
        </p>
        {membersComponentInputs.map((input, index) => (
          <MembersComponent
              key={index}
              clubId={input.clubId}
              name={input.name}
              role={input.role}
              userRole={role}
          />
        ))}
      </div>
    );
  };

export default Members;