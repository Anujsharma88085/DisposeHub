let users = {};
let pickupLocations = [];
let ioInstance = null;
let driverSockets = new Map();
let userSockets = new Map();

const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 New user connected:", socket.id);
    console.log("User ID from token:", socket.userId);

    socket.on("user-connect", (data) => {
      userSockets.set(socket.userId, socket.id);
      console.log("👤 User connected:", socket.userId);
      
      socket.emit("existing-pickup-locations", pickupLocations);
    });

    socket.on("driver-connect", (data) => {
      driverSockets.set(socket.id, { userId: socket.userId, socketId: socket.id });
      console.log("🚛 Driver connected:", socket.id);
      
      // Send existing pickup locations to the driver
      socket.emit("existing-pickup-locations", pickupLocations);
    });

    socket.on("location", (data) => {
      users[socket.userId] = { ...data, socketId: socket.id, lastUpdate: Date.now() };
      // Broadcast to drivers only
      driverSockets.forEach((driver, driverSocketId) => {
        io.to(driverSocketId).emit("users-locations", users);
      });
    });

    socket.on("new-pickup-location", (pickupData) => {
      const newPickup = {
        id: pickupData.id || Date.now(),
        lat: pickupData.lat,
        long: pickupData.lng || pickupData.long,
        name: pickupData.locationName || pickupData.name,
        userId: pickupData.userId || socket.userId,
        userSocketId: socket.id,
        active: true,
        timestamp: new Date().toISOString()
      };
      
      pickupLocations = pickupLocations.filter(p => p.userId !== newPickup.userId);
      pickupLocations.push(newPickup);
      
      io.emit("new-pickup-location", newPickup);
      
      socket.emit("pickup-confirmed", newPickup);
    });

    socket.on("driver-location", (data) => {
      const driverData = {
        driverId: socket.userId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString()
      };
      
      // IMMEDIATELY broadcast driver location to all users
      userSockets.forEach((userSocketId, userId) => {
        io.to(userSocketId).emit("driver-location-update", driverData);
      });
    });

    socket.on("complete-pickup", (pickupId) => {
      const completedPickup = pickupLocations.find(p => p.id === pickupId);
      
      if (completedPickup) {
        pickupLocations = pickupLocations.filter(p => p.id !== pickupId);
        
        if (completedPickup.userSocketId) {
          io.to(completedPickup.userSocketId).emit("pickup-completed", {
            pickupId: pickupId,
            message: "Your garbage has been collected! 🎉"
          });
        }
        
        io.emit("pickup-location-removed", pickupId);
        
        io.emit("pickup-completed-broadcast", { pickupId });
      }
    });

    socket.on("cancel-pickup", (pickupId) => {
      const cancelledPickup = pickupLocations.find(p => p.id === pickupId);
      
      if (cancelledPickup && cancelledPickup.userSocketId === socket.id) {
        pickupLocations = pickupLocations.filter(p => p.id !== pickupId);
        
        io.emit("pickup-location-removed", pickupId);
        
        socket.emit("pickup-cancelled", {
          pickupId: pickupId,
          message: "Pickup request cancelled"
        });
        
      }
    });

    socket.on("refresh-locations", () => {
      if (driverSockets.has(socket.id)) {
        socket.emit("existing-pickup-locations", pickupLocations);
      }
      if (userSockets.has(socket.userId)) {
        socket.emit("existing-pickup-locations", pickupLocations);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      
      for (let [userId, userData] of Object.entries(users)) {
        if (userData.socketId === socket.id) {
          delete users[userId];
          break;
        }
      }
      
      if (driverSockets.has(socket.id)) {
        driverSockets.delete(socket.id);
      }
      
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      
      pickupLocations = pickupLocations.filter(p => p.userSocketId !== socket.id);
      
      driverSockets.forEach((driver, driverSocketId) => {
        io.to(driverSocketId).emit("users-locations", users);
      });
    });
  });
};

export const getPickupLocations = () => pickupLocations;
export const refreshPickupLocations = () => {
  if (ioInstance) {
    ioInstance.emit("existing-pickup-locations", pickupLocations);
  }
};
export const emitBinThrown = (id) => {
  if (ioInstance) {
    ioInstance.emit("bin-thrown", { id });
  }
};

export default initSocket;