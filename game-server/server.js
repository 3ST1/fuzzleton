const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow requests from your Vite dev server

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite dev server address
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

let rooms = {}; // In-memory store for rooms. For production, use a database.
// room_id: { players: [{id, name}], state: 'WAITING' | 'CREATING' | 'TESTING_SETUP' | 'TESTING', timer: 0, levels: [{playerId, levelData}] }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("createRoom", (callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // Simple random ID
    rooms[roomId] = {
      id: roomId,
      players: [{ id: socket.id, name: `Player_${socket.id.substring(0, 4)}` }],
      state: "WAITING",
      timer: 0,
      levels: [],
    };
    socket.join(roomId);
    console.log(`Room ${roomId} created by ${socket.id}`);
    callback({ roomId, players: rooms[roomId].players }); // Send room ID back to creator
    io.to(roomId).emit("roomUpdate", rooms[roomId]); // Notify everyone in room
  });

  socket.on("joinRoom", ({ roomId, playerName }, callback) => {
    if (rooms[roomId]) {
      if (rooms[roomId].players.find((p) => p.id === socket.id)) {
        // Already in room
        callback({ success: true, room: rooms[roomId] });
        return;
      }
      rooms[roomId].players.push({
        id: socket.id,
        name: playerName || `Player_${socket.id.substring(0, 4)}`,
      });
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
      callback({ success: true, room: rooms[roomId] });
    } else {
      callback({ success: false, message: "Room not found" });
    }
  });

  // More handlers: 'startGameRequest', 'submitLevel', 'disconnect' etc.
  socket.on("requestStartGame", (roomId) => {
    if (
      rooms[roomId] &&
      rooms[roomId].players.find((p) => p.id === socket.id)
    ) {
      // Check if requester is in room
      const room = rooms[roomId];
      if (room.state === "WAITING") {
        // && room.players.length >= MIN_PLAYERS (e.g., 2)
        room.state = "CREATING";
        room.timer = 5 * 60 * 1000; // 5 minutes in milliseconds
        room.levels = []; // Reset levels for this round
        io.to(roomId).emit("roomUpdate", room); // Update state for UI
        io.to(roomId).emit("startCreationPhase", { duration: room.timer });

        console.log(`Game starting in room ${roomId}. Creation phase.`);

        // Start server-side timer
        let creationInterval = setInterval(() => {
          room.timer -= 1000;
          io.to(roomId).emit("timerUpdate", { remainingTime: room.timer }); // Optional: send timer updates

          if (room.timer <= 0) {
            clearInterval(creationInterval);
            console.log(`Creation phase ended for room ${roomId}`);
            // Transition to testing phase
            startTestingPhaseLogic(roomId);
          }
        }, 1000);
        room.creationInterval = creationInterval; // Store to clear if needed
      }
    }
  });

  socket.on("submitLevel", ({ roomId, levelData }) => {
    if (
      rooms[roomId] &&
      rooms[roomId].players.find((p) => p.id === socket.id)
    ) {
      const room = rooms[roomId];
      if (room.state === "CREATING") {
        // Ensure player hasn't submitted already
        if (!room.levels.find((l) => l.playerId === socket.id)) {
          room.levels.push({ playerId: socket.id, levelData });
          console.log(`Player ${socket.id} submitted level for room ${roomId}`);
          // Optional: Notify room that player submitted
          io.to(roomId).emit("playerSubmittedLevel", { playerId: socket.id });

          // Check if all players submitted
          if (room.levels.length === room.players.length) {
            console.log(
              `All players in room ${roomId} submitted levels. Ending creation phase early.`
            );
            if (room.creationInterval) clearInterval(room.creationInterval);
            room.timer = 0; // Force timer end
            startTestingPhaseLogic(roomId);
          }
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          console.log(`Room ${roomId} is empty, deleting.`);
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("roomUpdate", room); // Notify remaining players
          // Handle game state if player disconnects mid-game
          // For example, if in 'CREATING' or 'TESTING' phase.
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});

function startTestingPhaseLogic(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.state = "TESTING_SETUP"; // Or directly to TESTING if distribution is fast
  io.to(roomId).emit("roomUpdate", room);
  console.log(`Room ${roomId} entering testing setup.`);

  // Simple level distribution: each player tests the next player's level (round-robin)
  // Ensure there are levels to test
  if (room.levels.length === 0) {
    console.log(`No levels submitted in room ${roomId}. Can't start testing.`);
    room.state = "WAITING"; // Or some other end state
    io.to(roomId).emit("roomUpdate", room);
    io.to(roomId).emit("testingCancelledNoLevels");
    return;
  }

  const playersWithLevels = room.players.filter((p) =>
    room.levels.find((l) => l.playerId === p.id)
  );
  if (playersWithLevels.length < 1) {
    // Need at least 1 level (ideally 2 for swapping)
    console.log(`Not enough players with levels in room ${roomId}.`);
    // Handle this, maybe let players test their own or end
    room.state = "WAITING";
    io.to(roomId).emit("roomUpdate", room);
    return;
  }

  playersWithLevels.forEach((player, index) => {
    // If only one player submitted, they test their own level.
    // Otherwise, assign round-robin.
    const levelToTestIndex =
      playersWithLevels.length === 1
        ? index
        : (index + 1) % playersWithLevels.length;
    const assignedLevelEntry = room.levels.find(
      (l) => l.playerId === playersWithLevels[levelToTestIndex].id
    );

    if (assignedLevelEntry) {
      // Get the socket for this specific player
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        playerSocket.emit("startTestingPhase", {
          levelToTest: assignedLevelEntry.levelData, // The SerializedScene string
          testDuration: 3 * 60 * 1000, // e.g., 3 minutes to test
        });
      }
    } else {
      console.warn(
        `Could not find level for player ${playersWithLevels[levelToTestIndex].id} to assign to ${player.id}`
      );
      // Potentially assign a default level or skip this player's test
    }
  });
  room.state = "TESTING";
  room.timer = 3 * 60 * 1000; // Testing timer, if you want to sync its end
  io.to(roomId).emit("roomUpdate", room); // Final state update to TESTING
  console.log(`Room ${roomId} now in TESTING phase.`);

  // Optional: Server-side timer for testing phase
  let testingInterval = setInterval(() => {
    room.timer -= 1000;
    // io.to(roomId).emit('timerUpdate', { remainingTime: room.timer }); // If UI needs it
    if (room.timer <= 0) {
      clearInterval(testingInterval);
      console.log(`Testing phase ended for room ${roomId}`);
      room.state = "WAITING"; // Or 'RESULTS', 'POST_GAME'
      io.to(roomId).emit("roomUpdate", room);
      io.to(roomId).emit("testingPhaseEnded");
      // Potentially collect scores/feedback here
    }
  }, 1000);
}
