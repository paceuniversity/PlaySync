export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  profilePictureUrl?: string;
  steamId?: string;
  xboxId?: string;
  riotId?: string;
  twitchId?: string; 
  youtubeId?: string; 
  linkedAccounts?: string[];
  gameLibrary?: string[];
  friendsList?: string[];
  joinedCommunities?: string[];
  lastActive?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  onlineStatus?: 'online' | 'offline' | 'busy' | 'away';
}
