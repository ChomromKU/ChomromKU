import { useLocation } from "react-router-dom";
import RequestedMember from "./_components/RequestedMember";

export default function RequestedMemberPage() {
    const location = useLocation();
    const { clubLabel } = location.state || {};

    return (
        <div>
            <RequestedMember clubLabel={clubLabel} />
        </div>
    );
}