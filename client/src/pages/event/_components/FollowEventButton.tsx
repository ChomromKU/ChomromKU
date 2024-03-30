import { Button } from "@mantine/core";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "react-router-dom";

type FollowEventButtonProps = {
  eventId: number;
  isFollowing: boolean;
};

export default function FollowEventButton({ eventId, isFollowing }: FollowEventButtonProps) {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
        if (response.status === 200) {
          const fetchedUserId = response.data.id;
          setUserId(fetchedUserId);
        } else {
          console.error('Failed to fetch user id');
        }
      } catch (error) {
        console.error('Error fetching user id:', error);
      }
    };
    if (user?.stdId) {
      fetchUserId();
    }
  }, [id, user?.stdId]);

  async function handleClick() {
    const status = isFollowing ? "unfollow" : "follow";
    try {
      await axios.post(`http://localhost:3001/events/${eventId}/follow?status=${status}`, {
        userId: userId,
      });
      window.location.reload();
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
