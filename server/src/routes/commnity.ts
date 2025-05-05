import express, { Request, Response } from 'express';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const communityRoutes = express.Router();

interface CreateCommunityRequest extends Request {
  body: {
    name: string;
    description: string;
    createdBy: string;
  };
}

/**
 * @swagger
 * /communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, createdBy]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Community created
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Server error
 */

communityRoutes.post(
  '/communities',
  async (req: CreateCommunityRequest, res: any) => {
    const { name, description, createdBy } = req.body;

    if (!name || !description || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const communityId = uuidv4();

      const communityRef = db.collection('communities').doc(communityId);
      const timestamp = admin.firestore.Timestamp.now();

      await communityRef.set({
        id: communityId,
        name,
        description,
        createdBy,
        createdAt: timestamp,
        profilePictureUrl: '',
        bannerUrl: '',
      });

      await db.collection('communityMembers').add({
        communityId,
        userId: createdBy,
        role: 'admin',
        joinedAt: timestamp,
      });

      const userRef = db.collection('users').doc(createdBy);
      await userRef.set(
        {
          joinedCommunities: admin.firestore.FieldValue.arrayUnion(communityId),
        },
        { merge: true }
      );

      return res.status(201).json({ success: true, communityId });
    } catch (error: any) {
      console.error('Error creating community:', error.message);
      return res.status(500).json({ error: 'Failed to create community' });
    }
  }
);

/**
 * @swagger
 * /communities/user/{userId}:
 *   get:
 *     summary: Get all communities joined by a user
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of communities
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

communityRoutes.get(
  '/communities/user/:userId',
  async (req: Request, res: any) => {
    const { userId } = req.params;

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { joinedCommunities = [] } = userDoc.data() || {};

      if (!joinedCommunities.length) {
        return res.json({ communities: [] });
      }

      const communityRefs = joinedCommunities.map((id: string) =>
        db.collection('communities').doc(id)
      );

      const snapshots = await db.getAll(...communityRefs);
      const communities = snapshots
        .filter((doc) => doc.exists)
        .map((doc) => doc.data());

      return res.json({ communities });
    } catch (error: any) {
      console.error('Error fetching user communities:', error.message);
      return res.status(500).json({ error: 'Failed to fetch communities' });
    }
  }
);

/**
 * @swagger
 * /communities/{communityId}:
 *   get:
 *     summary: Get details of a single community
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community details
 *       404:
 *         description: Community not found
 *       500:
 *         description: Server error
 */

communityRoutes.get(
  '/communities/:communityId',
  async (req: Request, res: any) => {
    const { communityId } = req.params;

    try {
      const doc = await db.collection('communities').doc(communityId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Community not found' });
      }

      return res.json({ community: doc.data() });
    } catch (error: any) {
      console.error('Error fetching community:', error.message);
      return res.status(500).json({ error: 'Failed to fetch community' });
    }
  }
);

communityRoutes.get(
  '/communities/:communityId/members',
  async (req: Request, res: any) => {
    const { communityId } = req.params;

    try {
      const snapshot = await db
        .collection('communityMembers')
        .where('communityId', '==', communityId)
        .get();

      const members = snapshot.docs.map((doc) => doc.data());

      return res.status(200).json({ members });
    } catch (error) {
      console.error('Error fetching community members:', error);
      return res
        .status(500)
        .json({ error: 'Failed to fetch community members' });
    }
  }
);

/**
 * @swagger
 * /communities/{communityId}/posts:
 *   post:
 *     summary: Create a new post in a community
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [authorId, content]
 *             properties:
 *               authorId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Missing fields
 *       404:
 *         description: Community/User not found
 *       500:
 *         description: Server error
 */

communityRoutes.post(
  '/communities/:communityId/posts',
  async (req: Request, res: any) => {
    const { communityId } = req.params;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: 'Missing authorId or content' });
    }

    try {
      const communityDoc = await db
        .collection('communities')
        .doc(communityId)
        .get();

      if (!communityDoc.exists) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const userDoc = await db.collection('users').doc(authorId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { username } = userDoc.data() || {};

      const newPostRef = db.collection('communityPosts').doc();
      const postData = {
        id: newPostRef.id,
        communityId,
        authorId,
        authorUsername: username || 'Unknown',
        content,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: null,
      };

      await newPostRef.set(postData);

      return res.status(201).json({ success: true, post: postData });
    } catch (error: any) {
      console.error('[POST ROUTE] Error creating post:', error.message);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

/**
 * @swagger
 * /communities/{communityId}/posts:
 *   get:
 *     summary: Get all posts in a community
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 *       404:
 *         description: Community not found
 *       500:
 *         description: Server error
 */

communityRoutes.get(
  '/communities/:communityId/posts',
  async (req: Request, res: any) => {
    const { communityId } = req.params;

    try {
      const communityDoc = await db
        .collection('communities')
        .doc(communityId)
        .get();

      if (!communityDoc.exists) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const postsSnapshot = await db
        .collection('communityPosts')
        .where('communityId', '==', communityId)
        .orderBy('createdAt', 'asc')
        .get();

      const posts = postsSnapshot.docs.map((doc) => doc.data());

      const authorIds = Array.from(new Set(posts.map((p: any) => p.authorId)));

      const userDocs = await Promise.all(
        authorIds.map((id) => db.collection('users').doc(id).get())
      );

      const userMap: Record<string, string> = {};
      userDocs.forEach((doc) => {
        if (doc.exists) {
          const data = doc.data();
          userMap[doc.id] = data?.username || 'Unknown';
        }
      });

      const enrichedPosts = posts.map((post: any) => ({
        ...post,
        authorUsername: userMap[post.authorId] || 'Unknown',
      }));

      return res.status(200).json({ success: true, posts: enrichedPosts });
    } catch (error: any) {
      console.error('Error fetching community posts:', error.message);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }
);

/**
 * @swagger
 * /communities/{postId}/replies:
 *   post:
 *     summary: Add a reply to a post
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [authorId, content]
 *             properties:
 *               authorId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created
 *       400:
 *         description: Missing fields
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

communityRoutes.post(
  '/communities/:postId/replies',
  async (req: Request, res: any) => {
    const { postId } = req.params;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const postDoc = await db.collection('communityPosts').doc(postId).get();
      if (!postDoc.exists) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const newReplyRef = db.collection('communityReplies').doc();
      const newReply = {
        id: newReplyRef.id,
        postId,
        authorId,
        content,
        createdAt: admin.firestore.Timestamp.now(),
      };

      await newReplyRef.set(newReply);

      return res.status(201).json({ success: true, reply: newReply });
    } catch (error: any) {
      console.error('Error creating reply:', error.message);
      return res.status(500).json({ error: 'Failed to post reply' });
    }
  }
);

/**
 * @swagger
 * /communities/{postId}/replies:
 *   get:
 *     summary: Get all replies for a specific post
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies
 *       500:
 *         description: Server error
 */

communityRoutes.get(
  '/communities/:postId/replies',
  async (req: Request, res: any) => {
    const { postId } = req.params;

    try {
      const repliesSnapshot = await db
        .collection('communityReplies')
        .where('postId', '==', postId)
        .orderBy('createdAt', 'asc')
        .get();

      const replies = repliesSnapshot.docs.map((doc) => doc.data());

      return res.status(200).json({ success: true, replies });
    } catch (error: any) {
      console.error('Error fetching replies:', error.message);
      return res.status(500).json({ error: 'Failed to fetch replies' });
    }
  }
);

/**
 * @swagger
 * /communities/posts/{postId}:
 *   delete:
 *     summary: Delete a post and its associated replies
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post and replies deleted
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

communityRoutes.delete(
  '/communities/posts/:postId',
  async (req: Request, res: any) => {
    const { postId } = req.params;

    try {
      const postRef = db.collection('communityPosts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const repliesSnapshot = await db
        .collection('communityReplies')
        .where('postId', '==', postId)
        .get();

      const batch = db.batch();

      repliesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      batch.delete(postRef);

      await batch.commit();

      return res
        .status(200)
        .json({ success: true, message: 'Post and replies deleted' });
    } catch (error: any) {
      console.error('Error deleting post and replies:', error.message);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }
);

/**
 * @swagger
 * /communities/posts/{postId}:
 *   delete:
 *     summary: Delete a post and its associated replies
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post and replies deleted
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

communityRoutes.delete(
  '/:communityId/leave/:userId',
  async (req: Request, res: any) => {
    const { communityId, userId } = req.params;

    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        joinedCommunities: admin.firestore.FieldValue.arrayRemove(communityId),
      });

      const communityRef = db.collection('communities').doc(communityId);
      await communityRef.update({
        members: admin.firestore.FieldValue.arrayRemove(userId),
      });

      await db
        .collection('communityMembers')
        .doc(`${communityId}_${userId}`)
        .delete();

      return res.status(200).json({ message: 'Left community successfully.' });
    } catch (error) {
      console.error('Leave community failed:', error);
      return res.status(500).json({ error: 'Failed to leave community' });
    }
  }
);
/**
 * @swagger
 * /{communityId}:
 *   patch:
 *     summary: Update a community’s information
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Community updated
 *       500:
 *         description: Server error
 */

communityRoutes.patch('/:communityId', async (req: Request, res: any) => {
  const { communityId } = req.params;
  const updates = req.body;

  try {
    const communityRef = db.collection('communities').doc(communityId);
    await communityRef.update({
      ...updates,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ message: 'Community updated successfully.' });
  } catch (error) {
    console.error('Failed to update community:', error);
    return res.status(500).json({ error: 'Failed to update community info' });
  }
});

export default communityRoutes;
