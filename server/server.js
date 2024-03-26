// require
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const z = require('zod');

// process
const PORT = process.env.PORT || 3001;
const appKey = process.env.KU_APP_KEY
const KU_PUBLIC_KEY = process.env.KU_PUBLIC_KEY?.replace(/\\n/gm, "\n");

// link
const loginLink = 'https://myapi.ku.th/auth/login'
const publicCBP = 'https://myapi.ku.th/common/publicCBP'

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());



// Clubs

app.get('/clubs', async (req, res) => {
    try {
        const clubs = await prisma.club.findMany();
        res.json(clubs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching book stores' });
    }
});

app.get('/clubs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const club = await prisma.club.findUnique({
            where: { id: parseInt(id) },
            include: {
                subscribers: true,
                events: { where: { approved: true } },
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching book store' });
    }
});

app.put('/clubs/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body; // Assuming the payload is sent as JSON in the request body
    console.log('Updated fields:', updatedFields);
    try {
        // Check if SocialMedia record exists for the club
        const socialMediaExists = await prisma.socialMedia.findUnique({
            where: { clubId: parseInt(id) }
        });

        // If SocialMedia record does not exist, handle it based on your requirements
        if (!socialMediaExists) {
            // Handle missing SocialMedia record (create a new record or handle differently)
            // For example, you can create a new SocialMedia record here
            await prisma.socialMedia.create({
                data: {
                    clubId: parseInt(id),
                    facebook: updatedFields.socialMedia?.facebook,
                    instagram: updatedFields.socialMedia?.instagram,
                    twitter: updatedFields.socialMedia?.twitter,
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
                        twitter: updatedFields.socialMedia?.twitter,
                    },
                },
            },
        });

        res.json(updatedClub);
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Error updating club' });
    }
});



// Posts

app.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching book stores' });
    }
});

app.post('/posts', async (req, res) => {
    try {
        const postData = req.body;
        const newPost = await prisma.post.create({
            data: postData,
        });
        res.json(newPost);
        console.log('New post created:', newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: {
                likes: true,
                comments: true,
                club: { select: { id: true, label: true, branch: true, category:true, location: true, phoneNumber: true, socialMedia: { select: { facebook: true, instagram: true, twitter: true}}}},
                owner:true,
                // SocialMedia:true,
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching post' });
    }
});



// Like & Comment

const createLikeSchema = z.object({
    type: z.enum(["event", "post"]),
});

app.post('/posts/:id/like', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const validator = createLikeSchema.safeParse(body);
    if (!validator.success) {
        return res.status(400).json("กรุณากรอกข้อมูลให้ถูกต้อง");
    }
    const { type } = validator.data;

    try {
        // Check if the user has already liked this post
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: body.userId,
                postId: parseInt(id),
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
              postId: parseInt(id),
              userId: userId,
            },
          });

        if (!like) {
            return res.status(404).json({ error: "Like not found" });
        }

        const deletedLike = await prisma.like.delete({ where: { id: like.id } });
        res.status(200).json(deletedLike);
    } catch (error) {
        console.error("Error deleting like:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
  
const createCommentSchema = z.object({
	message: z.string().min(1).max(1000),
	type: z.enum(["event", "post"]),
});

app.post('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
	const body = req.body;

	const validator = createCommentSchema.safeParse(body);
	if (!validator.success) {
		res.json("กรุณากรอกข้อมูลให้ถูกต้อง", { status: 400 });
	}
	const { type, message } = validator.data;

	try {
		const newComment = await prisma.comment.create({
			data: {
				message: message,
				userId: body.userId,
				postId: type === "post" ? parseInt(id) : undefined,
				eventId: type === "event" ? parseInt(id) : undefined,
			},
		});
        console.log(newComment);
		res.status(201).json(newComment);
	} catch (error) {
		res.json({ error: error }, { status: 500 });
	}
});

app.get('/posts/:id/comment', async (req, res) => {
    const { id } = req.params;
  
    try {      const comments = await prisma.comment.findMany({
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
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});


app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: {
                club: true,
            },
        });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching event' });
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

// member request form

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

// get /api/clubs/${clubId}/follow?status=${status}
app.get('/clubs/:id/follow', async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    try {
        const members = await prisma.member.findMany({
            where: {
                clubId: parseInt(id),
                status: status,
            },
            include: { user: true },
        });
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching club members' });
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





app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});