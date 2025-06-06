const { Server } = require('socket.io');
const { User } = require('../models');

let io;
const userSockets = new Map(); // Map to store user ID -> socket ID
const roleSockets = new Map(); // Map to store role -> array of socket IDs

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Authenticate user and store their socket ID
    socket.on('authenticate', async (token) => {
      try {
        // Here you would verify the token and get the user ID
        // For simplicity, we'll just use the token as the user ID
        const userId = token;
        
        if (userId) {
          // Find user in database to get their role
          const user = await User.findById(userId);
          
          if (user) {
            // Store the socket ID for this user
            userSockets.set(userId, socket.id);
            socket.userId = userId;
            socket.userRole = user.role;
            
            // Add socket to role-based map
            if (!roleSockets.has(user.role)) {
              roleSockets.set(user.role, new Set());
            }
            roleSockets.get(user.role).add(socket.id);
            
            console.log(`User ${userId} (${user.role}) authenticated with socket ${socket.id}`);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (socket.userId) {
        userSockets.delete(socket.userId);
        
        // Remove from role-based map
        if (socket.userRole && roleSockets.has(socket.userRole)) {
          roleSockets.get(socket.userRole).delete(socket.id);
        }
      }
    });
  });

  return io;
};

// Send notification to a specific user
const sendToUser = (userId, event, data) => {
  if (!io) return console.error('Socket.io not initialized');
  
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`Notification sent to user ${userId} via socket ${socketId}`);
    return true;
  }
  return false;
};

// Send notification to all users with a specific role
const emitToRole = async (role, event, data) => {
  if (!io) return console.error('Socket.io not initialized');
  
  try {
    let sentCount = 0;
    
    // If we have cached socket IDs for this role, use them
    if (roleSockets.has(role) && roleSockets.get(role).size > 0) {
      const socketIds = Array.from(roleSockets.get(role));
      
      // Send to each socket
      for (const socketId of socketIds) {
        io.to(socketId).emit(event, data);
        sentCount++;
      }
      
      console.log(`Notification sent to ${sentCount} ${role} users via cached sockets`);
      return sentCount;
    }
    
    // Fallback: Find all users with the specified role
    const users = await User.find({ role });
    
    // Send notification to each user
    for (const user of users) {
      const socketId = userSockets.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit(event, data);
        sentCount++;
      }
    }
    
    console.log(`Notification sent to ${sentCount}/${users.length} ${role} users via user lookup`);
    return sentCount;
  } catch (error) {
    console.error('Error sending notification to role:', error);
    return 0;
  }
};

// Broadcast to all connected clients
const broadcast = (event, data) => {
  if (!io) return console.error('Socket.io not initialized');
  
  io.emit(event, data);
  console.log(`Broadcast event: ${event}`);
};

// Broadcast to a specific room
const broadcastToRoom = (room, event, data) => {
  if (!io) return console.error('Socket.io not initialized');
  
  io.to(room).emit(event, data);
  console.log(`Broadcast to room ${room}, event: ${event}`);
};

module.exports = {
  initializeSocket,
  sendToUser,
  emitToRole,
  broadcast,
  broadcastToRoom
}; 