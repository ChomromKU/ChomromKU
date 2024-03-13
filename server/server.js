const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const app = express();
const prisma = new PrismaClient();
const publicCBP = 'https://myapi.ku.th/common/publicCBP'
const appKey = process.env.KU_APP_KEY


app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const loginLink = 'https://myapi.ku.th/auth/login'

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
                members: { select: { id: true, user: true } },
                posts: { include: { owner: true, likes: true, club: true } },
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

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
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
      
      res.json(response.data)
      console.log("Login/ Done")
  
    } catch (e) {
      console.log(e)
      try{
        res.status(e.response.status).json(e)
        console.log("Login/ Fail, success ku api")
      } catch {
        res.status(400).json({"code" :"Fail to login"})
        console.log("Login/ Fail, unsuccess ku api")
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


const KU_PUBLIC_KEY = process.env.KU_PUBLIC_KEY?.replace(/\\n/gm, "\n");
  
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

// get http://localhost:3001/events?clubId=${clubId}&status=${status}
// app.get('/events', async (req, res) => {
//     const { clubId, status } = req.query;
//     try {
//         const events = await prisma.event.findMany({
//             where: {
//                 clubId: parseInt(clubId),
//                 status: status,
//             },
//         });
//         res.json(events);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error fetching events' });
//     }
// });



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
