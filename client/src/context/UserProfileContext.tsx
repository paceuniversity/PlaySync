import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
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

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => useContext(UserContext!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState(' ');
  const [userBio, setUserBio] = useState(' ');
  const [userStatus, setUserStatus] = useState('offline');
  const [userCommunities, setUserCommunities] = useState(0);

  return (
    <UserContext.Provider
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
    </UserContext.Provider>
  );
};
