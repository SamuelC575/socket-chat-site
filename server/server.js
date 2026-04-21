const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let idUser = []

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

// Lobby Storage
const lobbies = {};

for (let i = 1; i <= 10; i++) {
    lobbies[i] = {}; // { socketId: username }
}

// Socket Connect
io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);

    let currentLobby = null;
    let username = `Guest_${socket.id.slice(0, 5)}`;

    idUser.push([socket.id, username]);

    // announce connection (optional global message)
    io.emit('chat-message', `Server: ${username} connected`);

    // Join Lobby
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

        // console.log(`${username} joined lobby ${currentLobby}`);

        io.emit('chat-message', `Server: ${username} joined lobby ${currentLobby}`);

        sendLobbyData();
    });

    // Chat Message
    socket.on('chat-message', (message) => {
        if (!currentLobby) return;

        socket.to(currentLobby).emit(
            'chat-message',
            `${username}: ${message}`
        );
    });

    // Change Username
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

        for (let i = 0; i < idUser.length; i++) {
            if (idUser[i][0] === socket.id) {
                idUser[i][1] = newUsername;
                // console.log(idUser);
            }
        }
        sendLobbyData();
    });

    // Recommend
    socket.on('recommend', review => {
        console.log();
        console.log(review);
        console.log();
    })

    socket.on('server', (serverMessage) => {
        io.emit('chat-message',serverMessage)
    })

    socket.on('log', (logMessage) => {
        console.log(logMessage)
    })

    // Disconnect
    socket.on('disconnect', () => {
        if (currentLobby) {
            delete lobbies[currentLobby][socket.id];
        }
    
        idUser = idUser.filter(([id]) => id !== socket.id);

        io.emit('chat-message', `Server: ${username} disconnected`);
        // console.log('User disconnected:', socket.id);

        sendLobbyData();
    });

    socket.on('kick', (kickUser,code, codeId) => {
        if (!codeId) {
            return;
        }
        if (code == "1_25_1" && (codeId.includes('-') || codeId.includes('_'))) {
            console.log(kickUser,code)

            let socketId = findSocketByUser(kickUser);

            io.to(socketId).emit('kick')
        }
    })

    function findSocketByUser(username) {
        for (const [id, user] of idUser) {
            if (user === username) {
                return id;
            }
        }
    }

    function findSocketById(ID) {
        for (const [id, user] of idUser) {
            if (id === ID) {
                return user;
            }
        }
    }

    // Player List
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
    // console.log(`Server running on port ${PORT}`);
});