import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../api";
import { useAuthToken } from "../contexts/authentication";
import { jwtDecode } from "jwt-decode";

interface CurrentUser {
  username: string;
  pictureUrl: string;
}

export const useCurrentUser = () => {
  const token = useAuthToken();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      return await getUserById(token, jwtDecode<{ id: string }>(token).id);
    },
  });

  const currentUser: CurrentUser | null = user ? {
    username: user.username,
    pictureUrl: user.pictureUrl,
  } : null;

  return {
    currentUser,
    isLoading,
  };
}; 