export interface IFriendRequest {
  recipientId: string;
  requestorId: string;
  status: 'pending' | 'accept' | 'rejected';
  createdAt: FirebaseFirestore.Timestamp;
}
