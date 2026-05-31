const socketIO = require('socket.io');

let ioInstance = null;
const userSockets = new Map(); // userId -> socketId map

const initSockets = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Store user ID mapping to room and map when logged in
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        userSockets.set(userId.toString(), socket.id);
        console.log(`User ID ${userId} registered socket channel: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
      for (const [uid, sid] of userSockets.entries()) {
        if (sid === socket.id) {
          userSockets.delete(uid);
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Emit real-time notification to a target user
 */
const sendNotification = (userId, type, message, data = {}) => {
  if (ioInstance) {
    console.log(`Emitting Socket.IO message to user ${userId} [${type}]: ${message}`);
    ioInstance.to(userId.toString()).emit('notification', {
      type,
      message,
      data,
      createdAt: new Date()
    });
  } else {
    console.warn('Socket.IO instance not initialized. Unable to send notification.');
  }
};

module.exports = {
  initSockets,
  sendNotification
};
