import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messagePreview: { type: String, required: true },
    
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;