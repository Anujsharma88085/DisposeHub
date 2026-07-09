import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

import Navbar from "../components/websiteNavbar";
import { getNotifications } from "../apis/notificationApi";
import { getSocket } from "../socket/socket";
import { setLoading, setNotifications, addNotification, } from "../redux/slices/notificationSlice";
import { EVENTS } from "../socket/events";
import { updateUser } from "../redux/slices/authSlice";
import { showErrorToast } from "../utils/showErrorToast";


export default function AppLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        dispatch(setLoading(true));

        const data = await getNotifications();

        dispatch(
          setNotifications({
            notifications: data.notifications,
            unreadCount: data.unreadCount,
          })
        );
      } catch (error) {
        showErrorToast(error);

        if (import.meta.env.DEV) {
          console.error("Failed to fetch notifications:", error);
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchNotifications();
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewNotification = (payload) => {
      const notification = payload.notification;
      const user = payload.user;
      dispatch(addNotification(notification));
      dispatch(updateUser(user));
    };

    socket.on(EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      socket.off(EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, [dispatch]);
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}