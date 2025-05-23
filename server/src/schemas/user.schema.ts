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
  twitchAccount?: {
    username: string;
    profileUrl: string;
  };
  youtubeAccount?: {
    channelId: string;
    channelUrl: string;
  };
  linkedAccounts?: string[];
  numOfGames?: number;
  numOfFriends: number;
  numOfCommunities?: number;
  gameLibrary?: string[];
  friendsList?: string[];
  friendRequests?: string[];
  joinedCommunities?: string[];
  lastActive?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  onlineStatus?: 'online' | 'offline';
}
