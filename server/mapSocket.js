let users = {};
let pickupLocations = []; // Store active pickup locations
let ioInstance = null;
let driverSockets = new Map(); // Track driver connections
let userSockets = new Map(); // Track user connections

const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 New user connected:", socket.id);
    console.log("User ID from token:", socket.userId);

    // Handle user identification
    socket.on("user-connect", (data) => {
      userSockets.set(socket.userId, socket.id);
      console.log("👤 User connected:", socket.userId);
      
      // Send existing pickup locations to this user
      socket.emit("existing-pickup-locations", pickupLocations);
    });

    // Handle driver identification
    socket.on("driver-connect", (data) => {
      driverSockets.set(socket.id, { userId: socket.userId, socketId: socket.id });
      console.log("🚛 Driver connected:", socket.id);
      
      // Send existing pickup locations to the driver
      socket.emit("existing-pickup-locations", pickupLocations);
    });

    // Handle user location updates (real-time)
    socket.on("location", (data) => {
      users[socket.userId] = { ...data, socketId: socket.id, lastUpdate: Date.now() };
      // Broadcast to drivers only
      driverSockets.forEach((driver, driverSocketId) => {
        io.to(driverSocketId).emit("users-locations", users);
      });
    });

    // Handle new pickup location from user
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
      
      // Remove any existing pickup from same user
      pickupLocations = pickupLocations.filter(p => p.userId !== newPickup.userId);
      pickupLocations.push(newPickup);
      console.log("📍 New pickup location added:", newPickup);
      
      // IMMEDIATELY broadcast to all drivers
      io.emit("new-pickup-location", newPickup);
      
      // Also send to the user who created it for confirmation
      socket.emit("pickup-confirmed", newPickup);
    });

    // Handle driver location updates (real-time)
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

    // Handle pickup completion (when driver collects garbage)
    socket.on("complete-pickup", (pickupId) => {
      const completedPickup = pickupLocations.find(p => p.id === pickupId);
      
      if (completedPickup) {
        pickupLocations = pickupLocations.filter(p => p.id !== pickupId);
        console.log("✅ Pickup completed:", pickupId);
        
        // IMMEDIATELY notify the user who made the request
        if (completedPickup.userSocketId) {
          io.to(completedPickup.userSocketId).emit("pickup-completed", {
            pickupId: pickupId,
            message: "Your garbage has been collected! 🎉"
          });
        }
        
        // IMMEDIATELY notify all drivers to remove this pickup
        io.emit("pickup-location-removed", pickupId);
        
        // Also emit to all users for any UI updates
        io.emit("pickup-completed-broadcast", { pickupId });
      }
    });

    // Handle pickup cancellation by user
    socket.on("cancel-pickup", (pickupId) => {
      const cancelledPickup = pickupLocations.find(p => p.id === pickupId);
      
      if (cancelledPickup && cancelledPickup.userSocketId === socket.id) {
        pickupLocations = pickupLocations.filter(p => p.id !== pickupId);
        
        // IMMEDIATELY notify all drivers
        io.emit("pickup-location-removed", pickupId);
        
        socket.emit("pickup-cancelled", {
          pickupId: pickupId,
          message: "Pickup request cancelled"
        });
        
        console.log("❌ Pickup cancelled by user:", pickupId);
      }
    });

    // Handle location refresh request (for manual refresh)
    socket.on("refresh-locations", () => {
      if (driverSockets.has(socket.id)) {
        socket.emit("existing-pickup-locations", pickupLocations);
      }
      if (userSockets.has(socket.userId)) {
        socket.emit("existing-pickup-locations", pickupLocations);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      
      // Remove user from users object
      for (let [userId, userData] of Object.entries(users)) {
        if (userData.socketId === socket.id) {
          delete users[userId];
          break;
        }
      }
      
      // Remove driver from driverSockets
      if (driverSockets.has(socket.id)) {
        driverSockets.delete(socket.id);
      }
      
      // Remove user from userSockets
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      
      // Remove any pickup locations associated with this user
      pickupLocations = pickupLocations.filter(p => p.userSocketId !== socket.id);
      
      // Broadcast updated users to drivers
      driverSockets.forEach((driver, driverSocketId) => {
        io.to(driverSocketId).emit("users-locations", users);
      });
    });
  });
};

// Export functions
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