import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  console.log("Initializing Socket.IO...");
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected : ${socket.id}`);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`User Joined : ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket Disconnected : ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized.");
  return io;
};
