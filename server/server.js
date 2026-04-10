// cd /Users/samchoi/Documents/HTML\ Projects/Socket.io-Chat
// git add .
// git commit -m ""
// git push origin main

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

// ----------------------
// LOBBY STORAGE
// ----------------------
const lobbies = {};

for (let i = 1; i <= 10; i++) {
    lobbies[i] = {}; // { socketId: username }
}

// ----------------------
// SOCKET CONNECTIONS
// ----------------------
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let currentLobby = null;
    let username = `Guest_${socket.id.slice(0, 5)}`;

    // announce connection (optional global message)
    io.emit('chat-message', `Server: ${username} connected`);

    // ----------------------
    // JOIN LOBBY
    // ----------------------
    socket.on('join-lobby', (lobby) => {
        lobby = String(lobby);

        // leave previous lobby
        if (currentLobby) {
            socket.leave(currentLobby);
            delete lobbies[currentLobby][socket.id];
        }

        currentLobby = lobby;
        socket.join(currentLobby);

        // add to lobby
        lobbies[currentLobby][socket.id] = username;

        console.log(`${username} joined lobby ${currentLobby}`);

        io.emit('chat-message', `Server: ${username} joined lobby ${currentLobby}`);

        sendLobbyData();
    });

    // ----------------------
    // CHAT MESSAGE
    // ----------------------
    socket.on('chat-message', (message) => {
        if (!currentLobby) return;

        console.log(currentLobby)

        .to(currentLobby).emit(
            'chat-message',
            `${username}: ${message}`
        );
    });

    // ----------------------
    // CHANGE USERNAME
    // ----------------------
    socket.on('change-username', (newUsername) => {
        const oldUsername = username;
        username = newUsername;

        // update lobby record
        if (currentLobby) {
            lobbies[currentLobby][socket.id] = username;
        }

        socket.broadcast.emit(
            'chat-message',
            `Server: '${oldUsername}' changed their name to '${username}'`
        );

        sendLobbyData();
    });

    // ----------------------
    // DISCONNECT
    // ----------------------
    socket.on('disconnect', () => {
        if (currentLobby) {
            delete lobbies[currentLobby][socket.id];
        }

        io.emit('chat-message', `Server: ${username} disconnected`);
        console.log('User disconnected:', socket.id);

        sendLobbyData();
    });

    // ----------------------
    // SEND ALL LOBBY DATA
    // ----------------------
    function sendLobbyData() {
        const formatted = {};

        for (let i = 1; i <= 10; i++) {
            formatted[i] = Object.values(lobbies[i]);
        }

        io.emit('lobby-data', formatted);
    }
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});