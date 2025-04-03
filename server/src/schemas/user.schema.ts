export interface IUser {
  username: string;
  email: string;
  password: string;
  steamId?: string;
  xboxId?: string;
  psnId?: string;
  nintendoId?: string;
  linkedAccounts: string[];
  createdAt: FirebaseFirestore.Timestamp;
}
