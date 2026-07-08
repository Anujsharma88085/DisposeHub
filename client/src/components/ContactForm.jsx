import { useEffect, useState } from "react";
import { getMe } from "../../src/apis/userApi";
import {
  sendContactMessage,
  getContactStatus,
} from "../apis/contactApi";

const ContactBg =
  "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1470&q=80";

const formatRemainingTime = (ms) => {
  if (!ms || ms <= 0) return null;

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m remaining before you can send another message.`;
};

const ContactForm = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [canSend, setCanSend] = useState(true);
  const [remainingMs, setRemainingMs] = useState(0);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getMe();
        const user = data?.data?.data;
        setUser(user);

        const contactStatus = await getContactStatus();
        setCanSend(contactStatus.canSend);
        setRemainingMs(contactStatus.remainingMs || 0);
      } catch (err) {
        console.error("Failed to load contact data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ================= COOLDOWN TIMER ================= */

  useEffect(() => {
    if (canSend || remainingMs <= 0) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 60000) {
          clearInterval(interval);
          setCanSend(true);
          return 0;
        }
        return prev - 60000;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [canSend, remainingMs]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      await sendContactMessage(message);
      setStatus("✅ Message sent successfully!");
      setMessage("");

      const updatedStatus = await getContactStatus();
      setCanSend(updatedStatus.canSend);
      setRemainingMs(updatedStatus.remainingMs || 0);
    } catch (err) {
      setStatus(
        err.response?.data?.message || "❌ Failed to send message"
      );
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <p className="text-center mt-10 text-white">Loading...</p>
    );
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-white">
        Please login to contact us.
      </p>
    );
  }

  const cooldownText = formatRemainingTime(remainingMs);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{ backgroundImage: `url(${ContactBg})` }}
    >
      <div className="w-full max-w-xl bg-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl text-white">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
          📨 Contact Us
        </h2>

        {/* USER INFO */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-cyan-200">
            {user.name}
          </p>
          <p className="text-sm text-gray-300">{user.email}</p>
        </div>

        {/* COOLDOWN VIEW */}
        {!canSend ? (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">
              Message received 📩
            </h3>
            <p className="text-cyan-200">{cooldownText}</p>
            <p className="text-sm text-gray-400">
              You can send another message after the cooldown period.
            </p>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows="5"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              Send
            </button>

            {status && (
              <p
                className={`text-sm mt-2 ${
                  status.startsWith("✅")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {status}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
