// require
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const z = require('zod');
const bodyParser = require('body-parser');

const redis = require('redis');

const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const dotenv = require('dotenv');
const sharp = require('sharp');

dotenv.config();

// process
const PORT = process.env.PORT || 3001;
const appKey = process.env.KU_APP_KEY;
const KU_PUBLIC_KEY = process.env.KU_PUBLIC_KEY?.replace(/\\n/gm, "\n");
const s3Bucket = process.env.S3_BUCKET;
const s3Region = process.env.S3_REGION;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretKey = process.env.S3_SECRET_KEY;

const s3Client = new S3Client({
    region: s3Region,
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
    },
});

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// link
const loginLink = 'https://myapi.ku.th/auth/login'
const publicCBP = 'https://myapi.ku.th/common/publicCBP'

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });


// Redis
let redisConn = null;

const initRedis = async () => {
    redisConn = redis.createClient({ host: '127.0.0.1', port: 6379 });
    redisConn.on('error', err => console.error('Redis error:', err));
    await redisConn.connect();
    console.log('Connected to Redis');
};


// Clubs

app.get('/clubs', async (req, res) => {
    try {
        const cachedData = await redisConn.get('clubs');
        if (cachedData) {
            // cache hit
            console.log("Cache hit for all clubs");
            const result = JSON.parse(cachedData);
            res.json(result);
            return 
        }
        // cache miss
        const clubs = await prisma.club.findMany({
            include: {
                subscribers: true,
            }
        });
        const clubsSrtingCached = JSON.stringify(clubs);
        await redisConn.set('clubs', clubsSrtingCached, 'EX', 1800); // Cache for 30 minutes
        res.json(clubs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// no cache ver
// app.get('/clubs/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const club = await prisma.club.findUnique({
//             where: { id: parseInt(id) },
//             include: {
//                 subscribers: true,
//                 events: { include: { owner: true, likes: true, club: true } },
//                 members: { select: { id: true, role: true, user: true } },
//                 posts: { include: { owner: true, likes: true, club: true } },
//                 socialMedia: true,
//                 memberRequestForm: true
//             },
//         });
//         if (!club) {
//             return res.status(404).json({ error: 'Club not found' });
//         }
//         res.json(club);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error fetching book store' });
//     }
// });


// cache ver
app.get('/clubs/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `club:${id}`;

    try {
        const cachedData = await redisConn.get(cacheKey);
        if (cachedData) {
            // Cache hit
            console.log("Cache hit for club:", id);
            const club = JSON.parse(cachedData);
            res.json(club);
        } else {
            // Cache miss
            console.log("Cache miss for club:", id);
            const club = await prisma.club.findUnique({
                where: { id: parseInt(id) },
                include: {
                    subscribers: true,
                    events: { include: { owner: true, likes: true, club: true } },
                    members: { select: { id: true, role: true, user: true } },
                    posts: { include: { owner: true, likes: true, club: true } },
                    socialMedia: true,
                    memberRequestForm: true
                },
            });
            if (!club) {
                return res.status(404).json({ error: 'Club not found' });
            }
            res.json(club);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching club' });
    }
});


app.put('/clubs/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    const cacheKey = `club:${id}`; // Cache key for this club

    console.log('Updated fields:', updatedFields);
    try {
        const socialMediaExists = await prisma.socialMedia.findUnique({
            where: { clubId: parseInt(id) }
        });

        if (!socialMediaExists) {
            await prisma.socialMedia.create({
                data: {
                    clubId: parseInt(id),
                    facebook: updatedFields.socialMedia?.facebook,
                    instagram: updatedFields.socialMedia?.instagram,
                    line: updatedFields.socialMedia?.line,
                }
            });
        }

        // Update the club after ensuring the SocialMedia record exists
        const updatedClub = await prisma.club.update({
            where: { id: parseInt(id) },
            data: {
                category: updatedFields.category,
                location: updatedFields.location,
                phoneNumber: updatedFields.phoneNumber,
                socialMedia: {
                    update: {
                        facebook: updatedFields.socialMedia?.facebook,
                        instagram: updatedFields.socialMedia?.instagram,
                        line: updatedFields.socialMedia?.line,
                    },
                },
            },
            include: { // Include necessary fields to return the updated club
                subscribers: true,
                events: { include: { owner: true, likes: true, club: true } },
                members: { select: { id: true, role: true, user: true } },
                posts: { include: { owner: true, likes: true, club: true } },
                socialMedia: true,
                memberRequestForm: true
            },
        });

        // Update Redis cache with the updated club data
        await redisConn.set(cacheKey, JSON.stringify(updatedClub), 'EX', 1800); // Cache for 30 minutes

        res.json(updatedClub);
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Error updating club' });
    }
});


// Post for invidivual club

app.get('/clubs/:id/posts', async (req, res) => {
    const { id } = req.params;
    try {
        posts = await prisma.post.findMany({
            where: { clubId: parseInt(id) },
            include: {
                club: true,
                likes: true,
            },
        });
        for (let post of posts) {
            if (post.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: post.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                post.imageUrl = url;
            } else {
                post.imageUrl = ''
            }
        }
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

// Event for invidivual club
app.get('/clubs/:id/events', async (req, res) => {
    const { id } = req.params;
    try {
        events = await prisma.event.findMany({
            where: { clubId: parseInt(id) },
            include: {
                club: true,
                likes: true,
            },
        });
        for (let event of events) {
            if (event.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: event.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                event.imageUrl = url;
            } else {
                event.imageUrl = ''
            }
        }
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});

// Posts

app.get('/posts', async (req, res) => {
    const { limit } = req.query;
    try {
        let posts;
        if (limit) {
            const parsedLimit = parseInt(limit);
            posts = await prisma.post.findMany({
                take: parsedLimit,
                orderBy: { createdAt: 'desc' },
                include: {
                    likes: true,
                },
            });
        } else {
            posts = await prisma.post.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    likes: true,
                },
            });
        }
        for (let post of posts) {
            if (post.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: post.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                post.imageUrl = url;
            } else {
                post.imageUrl = ''
            }
        }
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

// cache ver
// app.get('/posts', async (req, res) => {
//     const { limit } = req.query;
//     // let cacheKey = 'posts';
    
//     // if (limit) {
//     //     cacheKey += `:limit:${limit}`;
//     // } else {
//     //     cacheKey += ':no-limit';
//     // }

//     try {
//         // const cachedData = await redisConn.get(cacheKey);
//         // if (cachedData) {
//         //     // Cache hit
//         //     // console.log("Cache hit for posts with limit:", limit || 'all');
//         //     const posts = JSON.parse(cachedData);
//         //     res.json(posts);
//         //     return;
//         // }

//         // // Cache miss
//         // console.log("Cache miss for posts with limit:", limit || 'all');
//         let posts;
//         if (limit) {
//             const parsedLimit = parseInt(limit);
//             posts = await prisma.post.findMany({
//                 take: parsedLimit,
//                 orderBy: { createdAt: 'desc' },
//                 include: {
//                     club: true,
//                     likes: true,
//                 },
//             });
//         } else {
//             posts = await prisma.post.findMany({
//                 orderBy: { createdAt: 'desc' },
//                 include: {
//                     club: true,
//                     likes: true,
//                 },
//             });
//         }
        
//         // Update Redis cache with the retrieved posts data
//         // await redisConn.set(cacheKey, JSON.stringify(posts), 'EX', 1800); // Cache for 30 minutes

//         res.json(posts);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error fetching posts' });
//     }
// });

app.post('/posts', upload.single('imageUrl'), async (req, res) => {
    const postData = req.body;
    req.file.buffer
    const imageName = randomImageName();
    const params = {
        Bucket: s3Bucket,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    try {
        const newPost = await prisma.post.create({
            data: {
                title: postData.title,
                type: postData.type,
                content: postData.content,
                // imageUrl: postData.imageUrl,
                imageUrl: imageName,
                approved: postData.approved === "true",
                createdAt: new Date(),
                updatedAt: new Date(),
                club: {
                  connect: { id: parseInt(postData.clubId) } 
                },
                owner: {
                  connect: { id: parseInt(postData.ownerId) } 
                },
              },
        });
        res.json(newPost);
        console.log('New post created:', newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Error creating post' });
    }
});

// cache ver
// app.post('/posts', async (req, res) => {
//     const postData = req.body;
//     console.log('Post data:', postData);
    
//     try {
//         const newPost = await prisma.post.create({
//             data: {
//                 title: postData.title,
//                 type: postData.type,
//                 content: postData.content,
//                 imageUrl: postData.imageUrl,
//                 approved: postData.approved,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 club: {
//                     connect: { id: parseInt(postData.clubId) } 
//                 },
//                 owner: {
//                     connect: { id: parseInt(postData.ownerId) } 
//                 },
//             },
//             include: {
//                 likes: true,
//             },
//         });

//         // Update Redis cache with the new post data
//         const cacheKey = `posts:${postData.limit || 'all'}`; // Cache key for posts with limit or all posts
//         const cachedData = await redisConn.get(cacheKey);
//         let updatedPosts = [];

//         if (cachedData) {
//             updatedPosts = JSON.parse(cachedData);
//             updatedPosts.unshift(newPost); // Add the new post to the beginning of the array
//         } else {
//             const existingPosts = await prisma.post.findMany({
//                 take: postData.limit ? parseInt(postData.limit) : undefined,
//                 orderBy: { createdAt: 'desc' },
//                 include: {
//                     likes: true,
//                 },
//             });
//             updatedPosts = existingPosts || [];
//             if (postData.limit && updatedPosts.length >= parseInt(postData.limit)) {
//                 // Remove the last element if the array length exceeds the limit
//                 updatedPosts.pop();
//             }
//             updatedPosts.unshift(newPost); // Add the new post to the beginning of the array
//         }

//         // Update the Redis cache with the updated posts data
//         await redisConn.set(cacheKey, JSON.stringify(updatedPosts), 'EX', 1800); // Cache for 30 minutes

//         res.json(newPost);
//         console.log('New post created:', newPost);
//     } catch (error) {
//         console.error('Error creating post:', error);
//         res.status(500).json({ error: 'Error creating post' });
//     }
// });




// no cache ver
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: {
                likes: true,
                comments: {
                    include: {
                        user:true,
                    },
                },
                club: { select: { id: true, label: true, branch: true, category:true, location: true, phoneNumber: true, socialMedia: { select: { facebook: true, instagram: true, line: true}}}},
                owner:true,
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if(post.imageUrl) {
            const getObjectParams = {
                Bucket: s3Bucket,
                Key: post.imageUrl,
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            post.imageUrl = url;
        } else {
            post.imageUrl = ''
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching post' });
    }
});

// cache ver
// app.get('/posts/:id', async (req, res) => {
//     const { id } = req.params;
//     const cacheKey = `post:${id}`;

//     try {
//         const cachedData = await redisConn.get(cacheKey);
//         if (cachedData) {
//             // Cache hit
//             console.log("Cache hit for post:", id);
//             const post = JSON.parse(cachedData);
//             res.json(post);
//         } else {
//             // Cache miss
//             console.log("Cache miss for post:", id);
//             const post = await prisma.post.findUnique({
//                 where: { id: parseInt(id) },
//                 include: {
//                     likes: true,
//                     comments: {
//                         include: {
//                             user:true,
//                         },
//                     },
//                     club: { select: { id: true, label: true, branch: true, category:true, location: true, phoneNumber: true, socialMedia: { select: { facebook: true, instagram: true, line: true}}}},
//                     owner:true,
//                 },
//             });
//             if (!post) {
//                 return res.status(404).json({ error: 'Post not found' });
//             }
//             // Store post data in cache
//             await redisConn.set(cacheKey, JSON.stringify(post), 'EX', 1800); // Cache for 30 minutes
//             res.json(post);
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error fetching post' });
//     }
// });

app.put('/posts/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await prisma.post.update({
            where: { id: parseInt(id) },
            data: { approved: true },
        });
        res.json({ message: 'Approve post successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Delete post successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Error deleting member' });
    }
});

app.get('/clubs/:id/posts/unapproved', async (req, res) => {
    const { id } = req.params;
    try {
        const clubPosts = await prisma.post.findMany({
            where: { 
                clubId: parseInt(id),
                approved: false
            },
            include: { 
                owner: true, 
                likes: true, 
                club: true 
            },
        });
        for (let clubPost of clubPosts) {
            if (clubPost.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: clubPost.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                clubPost.imageUrl = url;
            }
        }
        res.json(clubPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching unapproved club posts' });
    }
});

// Like & Comment

const createLikeSchema = z.object({
    type: z.enum(["event", "post"]),
});

// no cache ver
// app.post('/posts/:id/like', async (req, res) => {
//     const { id } = req.params;
//     const body = req.body;
//     const validator = createLikeSchema.safeParse(body);
//     if (!validator.success) {
//         return res.status(400).json("กรุณากรอกข้อมูลให้ถูกต้อง");
//     }
//     const { type } = validator.data;

//     try {
//         const existingLike = await prisma.like.findFirst({
//             where: {
//                 userId: body.userId,
//                 postId: type === "post" ? parseInt(id) : undefined,
//                 eventId: type === "event" ? parseInt(id) : undefined,
//             },
//         });
//         if (existingLike) {
//             return res.status(400).json({ error: "User has already liked this post" });
//         }

//         const newLike = await prisma.like.create({
//             data: {
//                 userId: body.userId,
//                 createdAt: new Date(),
//                 postId: type === "post" ? parseInt(id) : undefined,
//                 eventId: type === "event" ? parseInt(id) : undefined,
//             },
//         });
//         res.status(201).json(newLike);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error creating like" });
//     }
// });


// no cache ver
// app.delete('/posts/:id/like', async (req, res) => {
//     const { id } = req.params;
//     const { userId } = req.body;
//     const { type } = req.query; 
  
//     try {
//         const like = await prisma.like.findFirst({
//             where: {
//               postId: type === "post" ? parseInt(id) : undefined,
//               eventId: type === "event" ? parseInt(id) : undefined,
//               userId: userId,
//             },
//           });

//         if (!like) {
//             return res.status(404).json({ error: "Like not found" });
//         }

//         const deletedLike = await prisma.like.delete({ where: { id: like.id } });
//         res.status(200).json(deletedLike);
//     } catch (error) {
//         console.error("Error deleting like:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

app.post('/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const validator = createLikeSchema.safeParse(body);
    if (!validator.success) {
        return res.status(400).json("Invalid request data");
    }
    const { type } = validator.data;

    try {
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: body.userId,
                postId: type === "post" ? parseInt(id) : undefined,
                eventId: type === "event" ? parseInt(id) : undefined,
            },
        });
        if (existingLike) {
            return res.status(400).json({ error: "User has already liked this post" });
        }

        const newLike = await prisma.like.create({
            data: {
                userId: body.userId,
                createdAt: new Date(),
                postId: type === "post" ? parseInt(id) : undefined,
                eventId: type === "event" ? parseInt(id) : undefined,
            },
        });

        // Update cache
        const cacheKey = `${type}:${id}`;
        await redisConn.del(cacheKey); // Delete existing cache
        res.status(201).json(newLike);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating like" });
    }
});

app.delete('/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const { type } = req.query;

    try {
        const like = await prisma.like.findFirst({
            where: {
                postId: type === "post" ? parseInt(id) : undefined,
                eventId: type === "event" ? parseInt(id) : undefined,
                userId: userId,
            },
        });

        if (!like) {
            return res.status(404).json({ error: "Like not found" });
        }

        const deletedLike = await prisma.like.delete({ where: { id: like.id } });

        // Update cache
        const cacheKey = `${type}:${id}`;
        await redisConn.del(cacheKey); // Delete existing cache
        res.status(200).json(deletedLike);
    } catch (error) {
        console.error("Error deleting like:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// const createCommentSchema = z.object({
// 	message: z.string().min(1).max(1000),
// 	type: z.enum(["event", "post"]),
// });

// no cache ver
// app.post('/posts/:id/comment', async (req, res) => {
//     const { id } = req.params;
// 	const body = req.body;

// 	const validator = createCommentSchema.safeParse(body);
// 	if (!validator.success) {
// 		res.json("กรุณากรอกข้อมูลให้ถูกต้อง", { status: 400 });
// 	}
// 	const { type, message } = validator.data;

// 	try {
// 		const newComment = await prisma.comment.create({
// 			data: {
// 				message: message,
// 				userId: body.userId,
// 				postId: type === "post" ? parseInt(id) : undefined,
// 				eventId: type === "event" ? parseInt(id) : undefined,
// 			},
// 		});
//         console.log(newComment);
// 		res.status(201).json(newComment);
// 	} catch (error) {
// 		res.json({ error: error }, { status: 500 });
// 	}
// });


// no cache ver
// app.get('/posts/:id/comment', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const comments = await prisma.comment.findMany({
//         where: {
//           OR: [
//             { postId: parseInt(id) },
//             { eventId: parseInt(id) },
//           ],
//         },
//         include: {
//           user: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });
  
//       res.status(200).json(comments);
//     } catch (error) {
//       console.error('Error fetching comments:', error);
//       res.status(500).json({ error: 'Error fetching comments' });
//     }
//   });



// correct for both post and event
const createCommentSchema = z.object({
    message: z.string().min(1).max(1000),
    userId: z.number(),
    type: z.enum(["event", "post"]),
});


app.post('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const validator = createCommentSchema.safeParse(body);
    if (!validator.success) {
        return res.status(400).json({ error: "Invalid request data" });
    }
    const { message, userId, type } = validator.data;

    try {
        const newComment = await prisma.comment.create({
            data: {
                message: message,
                userId: userId,
                postId: type === "post" ? parseInt(id) : undefined,
                eventId: type === "event" ? parseInt(id) : undefined,
                createdAt: new Date(),
            },
            include: {
                user: true,
            },
        });

        // Update the cache with the new comment
        const cacheKey = `${type}:${id}`; // Update cache key based on post/event type
        const cachedData = await redisConn.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit for post or event:", id);
            const updatedData = JSON.parse(cachedData);
            updatedData.comments.push(newComment); // Add the new comment to the post/event's comments array
            await redisConn.set(cacheKey, JSON.stringify(updatedData), 'EX', 1800); // Update the cache
        }

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating comment' });
    }
});

app.get('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await prisma.comment.findMany({
            where: {
                OR: [
                    { postId: parseInt(id) },
                    { eventId: parseInt(id) },
                ],
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

// Events

app.get('/events', async (req, res) => {
    try {
        // const cachedData = await redisConn.get('events');
        // if (cachedData) {
        //     // Cache hit
        //     console.log("Cache hit for all events");
        //     const result = JSON.parse(cachedData);
        //     res.json(result);
        //     return ;
        // }
        // Cache miss
        // console.log("Cache miss for all events");
        const events = await prisma.event.findMany({
            where: {
                approved: true,
            },
            include: {
                likes: true,
                club: true,
                followers: true,
            }
        });
        for (let event of events) {
            if (event.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: event.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                event.imageUrl = url;
            } else {
                event.imageUrl = ''
            }
        }
        // await redisConn.set('events', JSON.stringify(events), 'EX', 1800); // Cache for 30 minutes
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});


// no cache ver
// app.post('/events', async (req, res) => {
//     const eventPostData = req.body;
//     console.log('Event Post data:', eventPostData);
//     try {
//         const newEventPost = await prisma.event.create({
//             data: {
//                 title: eventPostData.title,
//                 content: eventPostData.content,
//                 imageUrl: eventPostData.imageUrl,
//                 approved: eventPostData.approved,
//                 location: eventPostData.location,
//                 startDate: eventPostData.startDate ? new Date(eventPostData.startDate) : new Date(),
//                 endDate: eventPostData.endDate ? new Date(eventPostData.endDate) : new Date(),
//                 startTime: eventPostData.startTime ? eventPostData.startTime : '',
//                 endTime: eventPostData.endTime ? eventPostData.endTime : '', 
//                 status: 'OPEN',
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 club: {
//                   connect: { id: parseInt(eventPostData.clubId) } 
//                 },
//                 owner: {
//                   connect: { id: parseInt(eventPostData.ownerId) } 
//                 },
//               },
//         });
//         res.json(newEventPost);
//         console.log('New post created:', newEventPost);
//     } catch (error) {
//         console.error('Error creating post:', error);
//         res.status(500).json({ error: 'Error creating post' });
//     }
// });

app.post('/events', upload.single('imageUrl'), async (req, res) => {
    const eventPostData = req.body;
    req.file.buffer
    const imageName = randomImageName();
    const params = {
        Bucket: s3Bucket,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    try {
        const newEventPost = await prisma.event.create({
            data: {
                title: eventPostData.title,
                content: eventPostData.content,
                imageUrl: imageName,
                approved: eventPostData.approved === "true",
                location: eventPostData.location,
                startDate: eventPostData.startDate ? new Date(eventPostData.startDate) : new Date(),
                endDate: eventPostData.endDate ? new Date(eventPostData.endDate) : new Date(),
                startTime: eventPostData.startTime ? eventPostData.startTime : '',
                endTime: eventPostData.endTime ? eventPostData.endTime : '',
                status: 'OPEN',
                createdAt: new Date(),
                updatedAt: new Date(),
                club: {
                    connect: { id: parseInt(eventPostData.clubId) }
                },
                owner: {
                    connect: { id: parseInt(eventPostData.ownerId) }
                },
            },
            include: {
                likes: true,
                club: true,
                followers: true,
            }
        });

        // Update the cache with the new event
        // const cachedData = await redisConn.get('events');
        // if (cachedData) {
        //     console.log("Cache hit for all events");
        //     const cachedEvents = JSON.parse(cachedData);
        //     cachedEvents.push(newEventPost); // Add the new event to the cached events
        //     await redisConn.set('events', JSON.stringify(cachedEvents), 'EX', 1800); // Update the cache
        // }

        res.json(newEventPost);
        console.log('New event created:', newEventPost);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Error creating event' });
    }
});

// no cache ver
// app.get('/events/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const event = await prisma.event.findUnique({
//             where: { id: parseInt(id) },
//             include: {
//                 club: true,
//                 followers: true,
//                 likes: true,
//                 comments: {
//                     include: {
//                         user: true,
//                     },
//                 },
//             },
//         });
//         if (!event) {
//             return res.status(404).json({ error: 'Event not found' });
//         }
//         res.json(event);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error fetching event' });
//     }
// });

app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    // const cacheKey = `event:${id}`;

    try {
        // const cachedData = await redisConn.get(cacheKey);
        // if (cachedData) {
        //     // Cache hit
        //     console.log("Cache hit for event:", id);
        //     const event = JSON.parse(cachedData);
        //     if (event.imageUrl) {
        //         const getObjectParams = {
        //             Bucket: s3Bucket,
        //             Key: event.imageUrl,
        //         }
        //         const command = new GetObjectCommand(getObjectParams);
        //         const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        //         event.imageUrl = url;
        //     }
        //     res.json(event);
        // } else {
            // Cache miss
            console.log("Cache miss for event:", id);
            const event = await prisma.event.findUnique({
                where: { id: parseInt(id) },
                include: {
                    club: true,
                    followers: true,
                    likes: true,
                    comments: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }
            if (event.imageUrl) {
                const getObjectParams = {
                    Bucket: s3Bucket,
                    Key: event.imageUrl,
                }
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                event.imageUrl = url;
            } else {
                event.imageUrl = ''
            }
            // Store event data in cache
            // await redisConn.set(cacheKey, JSON.stringify(event), 'EX', 1800); // Cache for 30 minutes
            res.json(event);
        // }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching event' });
    }
});


app.put('/events/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.event.findUnique({
            where: { id: parseInt(id) },
        });
        if (!post) {
            return res.status(404).json({ error: 'Event post not found' });
        }
        await prisma.event.update({
            where: { id: parseInt(id) },
            data: { approved: true },
        });
        res.json({ message: 'Approve post event successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating event approval status' });
    }
});

app.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.event.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Delete event post successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Error deleting member' });
    }
});


// cache ver
// app.post('/events/:id/follow', async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.query;
//     const { userId } = req.body; 
  
//     try {
//       let updatedUser;
  
//       if (status === 'follow') {
//         updatedUser = await prisma.user.update({
//           where: { id: userId }, 
//           data: {
//             events: {
//               connect: { id: parseInt(id) },
//             },
//           },
//         });
//       } else if (status === 'unfollow') {
//         updatedUser = await prisma.user.update({
//           where: { id: userId },
//           data: {
//             events: {
//               disconnect: { id: parseInt(id) },
//             },
//           },
//         });
//       } else {
//         return res.status(400).json({ error: 'Invalid status' });
//       }
  
//       return res.status(200).json(updatedUser);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//   });

app.post('/events/:id/follow', async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    const { userId } = req.body; 

    try {
        let updatedUser;

        if (status === 'follow') {
            updatedUser = await prisma.user.update({
                where: { id: userId }, 
                data: {
                    events: {
                        connect: { id: parseInt(id) },
                    },
                },
                include: { events: true }, // Include events to update cache
            });
        } else if (status === 'unfollow') {
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    events: {
                        disconnect: { id: parseInt(id) },
                    },
                },
                include: { events: true }, // Include events to update cache
            });
        } else {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Update cache for the user
        await redisConn.set(`user:${userId}`, JSON.stringify(updatedUser), 'EX', 1800);

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


  

// Users

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.get('/users/:userStdId', async (req, res) => {
    const userStdId = req.params.userStdId;
    try {
        const user = await prisma.user.findUnique({
            where: {
                stdId: userStdId
            }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});


app.get('/clubs/:id/members', async (req, res) => {
    const { id } = req.params;
    try {
        const members = await prisma.member.findMany({
            where: { clubId: parseInt(id) },
            include: { user: true },
        });
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching club members' });
    }
});

app.put('/clubs/:id/members', async (req, res) => {
    const insertFields = req.body;
    try {
        const newMember = await prisma.member.create({
            data: {
                role: insertFields.role,
                clubId: insertFields.clubId,
                userId: insertFields.userId,
            }
        });
        res.json(newMember);
    } catch (error) {
        console.error('Error Creating Member:', error);
        res.status(500).json({ error: 'Error Creating Member' });
    }
});


app.put('/clubs/:id/members/:memberId/role', async (req, res) => {
    const { id, memberId } = req.params;
    const insertFields = req.body;
    try {
        const member = await prisma.member.findUnique({
            where: {id: parseInt(memberId),
                clubId: parseInt(id)
            }
        })
        if (!member){
            return res.status(404).json({error: "Member is not found"})
        }
        const updateMemberRole = await prisma.member.update({
            where: {id: parseInt(memberId),
                clubId: parseInt(id)
            },
            data: {
                role: insertFields.role,
            }
        });
        res.json(updateMemberRole);
    } catch (error) {
        console.error('Error Creating Member:', error);
        res.status(500).json({ error: 'Error Creating Member' });
    }
});

// member request form

app.get('/clubs/:id/requestedMember', async (req, res) => {
    const { id } = req.params;
    try {
        const memberRequestForm = await prisma.memberRequestForm.findMany({
            where: { clubId: parseInt(id) }
        });
        if (memberRequestForm) {
            res.json(memberRequestForm);
        } else {
            res.status(404).json({ error: 'Member Request Form not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching Member Request Form' });
    }
});

app.get('/clubs/:id/user/:userId/applyForm', async (req, res) => {
    const { id, userId } = req.params;
    try {
        const memberRequestForm = await prisma.memberRequestForm.findUnique({
            where: {
                clubId: parseInt(id),
                userId: parseInt(userId)
            }
        });
        if (memberRequestForm) {
            res.json(memberRequestForm);
        } else {
            res.status(404).json({ error: 'Member Request Form not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching Member Request Form' });
    }
});

app.put('/clubs/:id/user/:userId/applyForm', async (req, res) => {
    const { id, userId } = req.params;
    const insertFields = req.body;
    console.log('Insert fields:', insertFields);
    try {
        const newMemberRequestForm = await prisma.memberRequestForm.create({
            data: {
                clubId: parseInt(id),
                userId: parseInt(userId),
                year: insertFields.year,
                faculty: insertFields.faculty,
                department: insertFields.department,
                email: insertFields.email,
                phoneNumber: insertFields.phone,
                reason: insertFields.reason,
                createdAt: new Date()
            }
        });
        res.json(newMemberRequestForm);
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Error updating club' });
    }
});

app.delete('/clubs/:id/user/:userId/applyForm', async (req, res) => {
    const { id, userId } = req.params;
    try {
        await prisma.memberRequestForm.delete({
            where: {
                clubId: parseInt(id),
                userId: parseInt(userId),
            },
        });
        res.json({ message: 'Member Requested Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Error deleting member' });
    }
});


app.post('/clubs/:id/follow', async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    const { userId } = req.body;

    try {
		let updatedUser;

		if (status === "follow") {
			updatedUser = await prisma.user.update({
				where: { id: userId },
				data: {
					clubs: {
						connect: { id: parseInt(id) },
					},
				},
			});
		} else if (status === 'unfollow') {
			updatedUser = await prisma.user.update({
				where: { id: userId },
				data: {
					clubs: {
						disconnect: { id: parseInt(id) },
					},
				},
			});
		} else {
            return res.status(400).json({ error: 'Invalid status' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error following club' });
    }
});



// Authentication TODO:

app.post('/login', async (req, res) => {
    try {
      const encodedBody = {
        username: encodeString(req.body.username),
        password: encodeString(req.body.password)
      }
      
      const response = await axios.post(loginLink, encodedBody, {
        headers: {
          'app-key': appKey
        }
      })

      const { stdId, ...userData } = response.data.user.student;

      if (response.data.code == "success") {
		const updatedUserData = {
			titleTh: userData.titleTh,
			titleEn: userData.titleEn,
			firstNameTh: userData.firstNameTh,
			lastNameTh: userData.lastNameTh,
			firstNameEn: userData.firstNameEn,
			lastNameEn: userData.lastNameEn,
			campusNameTh: userData.campusNameTh,
			campusNameEn: userData.campusNameEn,
		};

		const newUser = await prisma.user.upsert({
			where: { stdId: stdId },
			update: updatedUserData,
			create: { stdId: stdId, ...updatedUserData },
		});
        res.json(response.data)
        console.log('Login/ success', stdId);
      }
      
    //   console.log(response.data)
    //   console.log("Login/ Done")
    } catch (e) {
      console.log(e)
      try{
        res.status(e.response.status).json(e)
        console.log("Login/ Fail, success ku api")
      } catch {
        res.status(400).json({"code" :"Fail to login"})
        console.log("Login/ Fail, unsuccess ku api (No response)")
      }
    }
  })
    

app.post('/encode', async (req, res) => {
    try {
        const encodedBody = {
        username: encodeString(req.body.username),
        password: encodeString(req.body.password)
        }
        return res.json(encodedBody)
    } catch (e) {
        console.log("fail to encode")
        return res.status(400).json({})
    }
})

// Encode username & password  
const encodeString = (data) => {
return crypto
    .publicEncrypt(
        {
            key: KU_PUBLIC_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data, "utf8")
    )
    .toString("base64");
};     





app.listen(PORT, async(req,res) => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await initRedis();
});