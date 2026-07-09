import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowLeft, FaEye, FaEyeSlash, } from "react-icons/fa";
import {uploadProfilePicture, updateUserProfile,  updatePassword, } from "../../apis/userApi";
import { updateUser } from "../../redux/slices/authSlice";
import defaultProfile from "../../assets/images/default-profile.png";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { showErrorToast } from "../../utils/showErrorToast";

export default function EditUserProfile() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: currentUser.name,
    profilePicture: currentUser.profilePicture,
    vehicleNumber: currentUser.vehicleNumber || "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    password: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    setEditedUser({
      name: currentUser.name,
      vehicleNumber: currentUser.vehicleNumber || "",
      profilePicture: currentUser.profilePicture,
    });
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async () => {
    const { passwordCurrent, password, passwordConfirm } = passwordData;

    if (!passwordCurrent || !password || !passwordConfirm) {
      toast.warning("Please fill all password fields.");
      return;
    }

    if (
      passwordCurrent.length < 5 ||
      password.length < 5 ||
      passwordConfirm.length < 5
    ) {
      toast.warning("Password must be at least 5 characters long.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.warning("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      await updatePassword(passwordData);

      setPasswordData({
        passwordCurrent: "",
        password: "",
        passwordConfirm: "",
      });

      toast.success("Password updated successfully.");
    } catch (error) {
      if(error.status === 400){
        toast.error("Current password is incorrect.");
      } else {
        showErrorToast(error);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const { data } = await uploadProfilePicture(file);

      dispatch(
        updateUser({
          ...currentUser,
          profilePicture: data.profilePicture,
        })
      );
      toast.success("ProfilePhoto uploaded successfully.");
    } catch (error) {
      showErrorToast(error);
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = await updateUserProfile(editedUser);
      dispatch(updateUser(updatedData.user));
      toast.success("Profile updated successfully.");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center p-8 bg-black min-h-screen text-white">
      <div className="w-full max-w-lg p-6 bg-white/10 backdrop-blur-md border border-gray-600 shadow-lg rounded-3xl relative">

        <button
          onClick={() => navigate(currentUser?.role === "admin" ? "/admin-dashboard" : "/profile")}
          className="absolute top-5 left-5 z-50 p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition cursor-pointer"
        >
          <FaArrowLeft />
        </button>

        {/* Profile Picture Upload */}
        <div className="relative flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg relative group">
            {uploading ? (
              <div className="w-36 h-36 flex items-center justify-center">
                Uploading...
              </div>
            ) : (
              <img
                src={editedUser.profilePicture || defaultProfile }
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

          {currentUser.role === "driver" && (
            <input
              type="text"
              name="vehicleNumber"
              value={editedUser.vehicleNumber}
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

        <div className="mt-10 border-t border-gray-600 pt-8">

          <h2 className="text-center text-2xl font-bold text-purple-400">
            Change Password
          </h2>

          <div className="mt-6 space-y-4">

            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="passwordCurrent"
                value={passwordData.passwordCurrent}
                onChange={handlePasswordChange}
                placeholder="Current Password"
                required
                minLength={5}
                className="w-full p-3 pr-12 text-lg border rounded-lg bg-black/20 border-purple-500 text-purple-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswords.password ? "text" : "password"}
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder="New Password (min length: 5)"
                required
                minLength={5}
                className="w-full p-3 pr-12 text-lg border rounded-lg bg-black/20 border-purple-500 text-purple-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="passwordConfirm"
                  value={passwordData.passwordConfirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  required
                  minLength={5}
                  className="w-full p-3 pr-12 text-lg border rounded-lg bg-black/20 border-purple-500 text-purple-200 focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwordData.passwordConfirm &&
                passwordData.password !== passwordData.passwordConfirm && (
                  <p className="mt-2 text-sm text-red-400">
                    Passwords do not match.
                  </p>
                )}
            </div>

          </div>

          <button
            onClick={handlePasswordUpdate}
            disabled={
              passwordLoading ||
              !passwordData.passwordCurrent ||
              !passwordData.password ||
              !passwordData.passwordConfirm ||
              passwordData.passwordCurrent.length < 5 ||
              passwordData.password.length < 5 ||
              passwordData.passwordConfirm.length < 5 ||
              passwordData.password !== passwordData.passwordConfirm
            }
            className="mt-6 w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {passwordLoading ? "Updating..." : "🔒 Update Password"}
          </button>

        </div>
      </div>

      
    </div>
  );
}
