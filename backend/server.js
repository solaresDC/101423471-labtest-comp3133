const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 

const connectDB = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const setupSocket = require('./socket/chatSocket');
connectDB();


const publicPath = path.join(__dirname, '../public'); 
app.use(express.json());
app.use(express.static(publicPath));


app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(publicPath, 'view', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'view', 'login.html'));
});

app.get('/chat-room', (req, res) => {
    res.sendFile(path.join(publicPath, 'view', 'chatRoom.html'));
});



app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);
setupSocket(io);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});



const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Public directory: ${publicPath}`);
});