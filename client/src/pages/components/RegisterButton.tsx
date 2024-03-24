import React, { useEffect, useState } from "react";
import { Link, LinkProps, useNavigate, useParams } from 'react-router-dom';

import { ClubMember } from '../../types/club';
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

interface RegisterButtonProps {
    member: ClubMember | undefined
    userId: number | undefined;
    editing: boolean
}

// Define the CustomLinkProps interface extending LinkProps
interface CustomLinkProps extends LinkProps {
    state?: {
      member: ClubMember;
    };
}

// Define the CustomLink component using CustomLinkProps
const CustomLink: React.FC<CustomLinkProps> = ({ state, ...rest }) => (
    <Link {...rest} to={rest.to} state={state} />
);

const RegisterButton: React.FC<RegisterButtonProps> = ({ member, userId, editing }) => {
    const navigate = useNavigate();
    const { id } = useParams();

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
                to={`/clubs/${id}/user/${userId}/applyForm`}
                state={{ member: member }}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", fontWeight: "400" }}
                className="text-sm py-1 px-4 border rounded-full"
            >
                ผู้สมัครเข้าชมรม
            </CustomLink>
        );
    }
    return null;
};

export default RegisterButton;
