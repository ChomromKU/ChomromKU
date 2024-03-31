import { Button } from "@mantine/core";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

type FollowEventButtonProps = {
  eventId: number;
  isFollowing: boolean;
};

export default function FollowEventButton({ eventId, isFollowing }: FollowEventButtonProps) {
  const { user } = useAuth();

  async function handleClick() {
    if (!user) {
			alert("กรุณาเข้าสู่ระบบ");
			return;
		}
    const status = isFollowing ? "unfollow" : "follow";
    try {
      const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
      if (response.status === 200) {
        await axios.post(`http://localhost:3001/events/${eventId}/follow?status=${status}`, {
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

  return (
    <Button
      variant="default"
      size="xs"
      radius="xl"
      style={{
        backgroundColor: "#006664",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "5px 10px",
        cursor: "pointer",
        fontWeight: "400",
      }}
      onClick={handleClick}
    >
      {isFollowing ? "เลิกติดตามอีเว้นท์นี้" : "ติดตามอีเว้นท์นี้"}
    </Button>
  );
}
