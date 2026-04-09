const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let currentLobby = null;
    let username = `Guest_${socket.id.slice(0, 5)}`; // default username

    // Global connect announcement
    io.emit('chat-message', `${username} has connected`);

    // Join lobby
    socket.on('join-lobby', (lobby) => {
        if (currentLobby) socket.leave(currentLobby);

        currentLobby = String(lobby);
        socket.join(currentLobby);

        console.log(`${username} joined lobby ${currentLobby}`);

        // Announce globally
        io.emit('chat-message', `Server: ${username} joined lobby ${currentLobby}`);
    });

    // Chat messages (only in lobby)
    socket.on('chat-message', (message, user) => {
        if (!currentLobby) return;

        // Broadcast to lobby excluding sender
        socket.to(currentLobby).emit('chat-message', `${user}: ${message}`);
    });

    // Username change
    socket.on('change-username', (newUsername) => {
        const oldUsername = username;
        username = newUsername;

        // Notify everyone else globally
        socket.broadcast.emit('chat-message', `Server: ${oldUsername} changed their name to ${username}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
        io.emit('chat-message', `${username} has disconnected`);
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});