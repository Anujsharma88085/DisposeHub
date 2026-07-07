import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Player } from "@lottiefiles/react-lottie-player";
import loadingAnimation from "../assets/loading.json";
import { getSocket } from "../socket/socket";
import { markNotificationsAsRead } from "../apis/notificationApi";
import { markAllAsRead } from "../redux/slices/notificationSlice";



const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
  } = useSelector((state) => state.notification);

  const dispatch = useDispatch();

  const handleMarkAllAsRead = async () => {
     try {
      await markNotificationsAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="absolute z-50 right-0 mt-6 w-80 bg-gray-900/80 backdrop-blur-2xl border border-cyan-500 shadow-xl rounded-2xl p-4 bell-dropdown transition-all duration-300 ease-in-out hover:shadow-cyan-500/50">
      <h3 className="text-lg font-semibold text-cyan-300 flex justify-between items-center mb-3">
        <span>Notifications</span>

        {unreadCount > 0 && (
          <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount} New
          </span>
        )}
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Player src={loadingAnimation} className="w-16 h-16" autoplay loop />
        </div>
      ) : notifications.length === 0 ? (
      <p className="text-gray-400 text-center py-4">
        No notifications yet
      </p>
      ) : (
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`relative p-3 mb-2 rounded-lg border transition-all duration-200
                ${
                  notif.isRead
                    ? "bg-gray-800/40 border-gray-700"
                    : "bg-cyan-900/30 border-cyan-500"
                }
                hover:bg-gray-800/60`}
            >
              {!notif.isRead && (
                <span className="absolute top-4 right-3 h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              )}

              <p
                className={`text-sm pr-5 ${
                  notif.isRead
                    ? "text-gray-300 font-normal"
                    : "text-white font-semibold"
                }`}
              >
                {notif.messagePreview}
              </p>
            </div>
          ))}
        </div>
      )}

      {unreadCount > 0 && !loading && (
        <button
          className="text-sm text-cyan-300 mt-3 w-full py-2 bg-gray-800/50 border border-cyan-500 rounded-lg transition-all hover:bg-cyan-500/30 hover:text-white shadow-md hover:shadow-cyan-500 cursor-pointer"
          onClick={handleMarkAllAsRead}
        >
          Mark all as Read
        </button>
      )}
    </div>
  );
};

export default NotificationDropdown;
