export interface IMessage {
  senderId: string;
  text?: string;
  imageUrl?: string;
  fileUrl?: string;
  sentAt: FirebaseFirestore.Timestamp;
}
