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
  psnId?: string;
  nintendoId?: string;
  gameLibrary?: string[];
  linkedAccounts?: string[];
  friendsList?: string[];
  onlineStatus?: 'online' | 'offline' | 'busy' | 'away';
  joinedCommunities?: string[];
  lastActive?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
}
