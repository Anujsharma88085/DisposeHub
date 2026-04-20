import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import {uploadProfilePicture, updateUserProfile } from "../../apis/userApi";

export default function EditUserProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState({
    name: location.state?.user?.name || "",
    email: location.state?.user?.email || "",
    role: location.state?.user?.role || "",
    profilePicture: location.state?.user?.profilePicture || "",
  });

  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadProfilePicture(file);

      setEditedUser((prev) => ({
        ...prev,
        profilePicture: data.data.profilePicture + "?t=" + new Date().getTime(),
      }));
    } catch (error) {
      console.error("Upload error:", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(editedUser);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center p-8 bg-black min-h-screen text-white">
      <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md border border-gray-600 shadow-lg rounded-3xl relative">
        {/* Profile Picture Upload */}
        <div className="relative flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg relative group">
            {uploading ? (
              <div className="w-36 h-36 flex items-center justify-center">
                Uploading...
              </div>
            ) : (
              <img
                src={editedUser.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover object-center scale-150"
              />
            )}
            
          
            {/* Plus Icon Overlay */}
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
              <FaPlus className="text-white text-2xl" />
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold mt-4 text-cyan-400">
          Edit Profile
        </h2>
        
        <div className="mt-6 space-y-4">
          <input
            type="text"
            name="name"
            value={editedUser.name}
            onChange={handleChange}
            placeholder="name"
            className="w-full p-3 text-lg border rounded-lg bg-black/20 border-cyan-500 text-cyan-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all duration-200"
          />

          

          {editedUser.role === "driver" && (
           
              <input
                type="text"
                name="VehicleNumber"
                value={editedUser.VehicleNumber}
                onChange={handleChange}
                placeholder="Vehicle Name"
                className="w-full p-3 text-lg border rounded-lg bg-black/20 border-cyan-500 text-cyan-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all duration-200"
              />
           
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-6 w-full py-3 text-lg bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-600 transition-shadow shadow-md hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Saving..." : "💾 Save Profile"}
        </button>
      </div>
    </div>
  );
}
