import { Link, LinkProps, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClubMember } from '../../types/club';

interface RegisterButtonProps {
    member: ClubMember | undefined
    userId: number | undefined;
    editing: boolean
    clubLabel: string
}

interface CustomLinkProps extends LinkProps {
    state?: {
        clubLabel: string;
    };
}

const CustomLink: React.FC<CustomLinkProps> = ({ state, ...rest }) => (
    <Link {...rest} to={rest.to} state={state} />
);

const RegisterButton: React.FC<RegisterButtonProps> = ({ clubLabel, member, userId, editing }) => {
    const { id } = useParams();
    const { user } = useAuth();
    
    if (!user) {
        return (
            <Link
                to={`/login`}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className={`text-sm py-1 px-4 rounded-full ${editing === true ? 'invisible' : 'visible'}`}
            >
                เข้าสู่ระบบเพื่อสมัครเข้าชมรม
            </Link>
        );
    }
    if (!member) {
        return (
            <Link
                to={`/clubs/${id}/user/${userId}/applyForm`}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className={`text-sm py-1 px-4 rounded-full ${editing === true ? 'invisible' : 'visible'}`}
            >
                สมัครเข้าชมรม
            </Link>
        );
    }

    if (member.role === 'PRESIDENT' || member.role === 'VICE_PRESIDENT') {
        return (
            <CustomLink
                to={`/clubs/${id}/requestedMember`}
                state={{ clubLabel: clubLabel }}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className="text-sm py-1 px-4 rounded-full flex items-center"
            >
                ผู้สมัครเข้าชมรม
            </CustomLink>
        );
    }
    return null;
};

export default RegisterButton;
