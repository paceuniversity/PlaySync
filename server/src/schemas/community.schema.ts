export interface ICommunity {
  id: string;
  name: string;
  description: string;
  createdAt: FirebaseFirestore.Timestamp;
  createdBy: string;

  members: string[];

  bannerUrl?: string;
  profilePictureUrl?: string;
}

export interface ICommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface ICommunityReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: FirebaseFirestore.Timestamp;
  parentReplyId?: string;
}

export interface ICommunityMember {
  userId: string;
  communityId: string;
  role: 'member' | 'admin';
  joinedAt: FirebaseFirestore.Timestamp;
}
