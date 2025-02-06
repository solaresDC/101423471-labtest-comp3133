const GroupMessage = require('../models/GroupMessage');

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('join room', (roomName) => {
            socket.join(roomName);
            io.to(roomName).emit('user joined', `User joined ${roomName}`);
        });
        socket.on('leave room', (roomName) => {
            socket.leave(roomName);
            io.to(roomName).emit('user left', `User left ${roomName}`);
        });
        
        socket.on('chat message', async (data) => {
            try {
                const { room, message, username } = data;
                const groupMessage = new GroupMessage({
                    from_user: 
                    username,
                    room,
                    message
                });
                await groupMessage.save();        
            io.to(room).emit('chat message', {
                    username,
                    message,
                    timestamp: new Date()
                });
            } catch (error) {
            console.error('Error saving message:', error);
            }
        });
        socket.on('typing', (data) => {
            socket.to(data.room).emit('user typing', data.username);
        });
        
        socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = setupSocket;