import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">🚫</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You don’t have permission to view this page.  
          Please contact the administrator or go back.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}