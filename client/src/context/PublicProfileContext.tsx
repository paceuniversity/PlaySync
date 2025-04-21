import { createContext, useContext, useState, ReactNode } from 'react';

interface FriendContextType {
  userId: string;
  setUserId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  userBio: string;
  setUserBio: (bio: string) => void;
  userCommunities: number;
  setUserCommunities: (numOfCommunities: number) => void;
  userStatus: string;
  setUserStatus: (onlineStatus: string) => void;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const useFriend = () => useContext(FriendContext!);

export const FriendProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState(' ');
  const [userBio, setUserBio] = useState(' ');
  const [userStatus, setUserStatus] = useState('offline');
  const [userCommunities, setUserCommunities] = useState(0);

  return (
    <FriendContext.Provider
      value={{
        userId,
        setUserId,
        username,
        setUsername,
        userBio,
        setUserBio,
        userCommunities,
        setUserCommunities,
        userStatus,
        setUserStatus,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};
