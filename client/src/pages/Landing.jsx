import { motion } from "framer-motion";
import { FaRecycle, FaBell,FaLaptop, FaCamera, FaTruck ,FaMapMarkerAlt } from "react-icons/fa";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import pickupImage from '../assets/garbage1.jpg';
import locationImage from '../assets/garbage2.jpg';
import instantResultsImage from '../assets/garbage4.jpg';
import recyclingInfoImage from '../assets/education.jpg';
import garbageCollectionImage from '../assets/garbage_van.jpg';
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function LandingPage({ isLoggedIn, role }) {
  
    const location = useLocation();


  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-800 text-white flex flex-col items-center justify-center p-8">
      {/* Header Section */}

      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-6xl w-full"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <FaRecycle size={70} className="text-yellow-400 animate-pulse mb-4" />
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
            Dispose Hub
          </h1>
          <p className="text-lg md:text-xl mt-6 text-gray-100 leading-relaxed tracking-wide max-w-3xl mx-auto text-center bg-purple-700 bg-opacity-30 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-yellow-500">
            ♻️ <span className="font-semibold text-yellow-300">Empowering you</span> to dispose of waste responsibly. Using our smart platform, you can find <span className="text-green-300 font-medium">real-time garbage collector locations</span> and gain <span className="text-blue-300 font-medium">local segregation insights</span> — all in one place.
            </p>

        </div>

        {/* Lottie Animation */}
        <div className="my-10 flex flex-col lg:flex-row items-center justify-between bg-opacity-10 p-8 border-purple-500 w-full max-w-6xl mx-auto">
        {/* Awareness Text Section */}

        <div className="lg:w-1/2 mb-8 lg:mb-0 text-left">
        <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-yellow-300 mb-4"
        >
            Know Before You Throw!
        </motion.h2>

        <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-gray-100 mb-3"
        >
            🌱 <strong>Dry Waste?</strong> → Use the blue bin.
        </motion.p>

        <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-100 mb-3"
        >
            ♻️ <strong>Wet Waste?</strong> → Compost or green bin.
        </motion.p>

        <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-gray-100 mb-3"
        >
            🛢️ <strong>Hazardous/E-waste?</strong> → Take to special drop-off centers.
        </motion.p>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-md text-purple-200 mt-4 italic"
        >
            “A cleaner neighborhood starts with your bin.”
        </motion.p>
        </div>


        {/* Animation Section */}
        <div className="lg:w-1/2 flex justify-center">
            <DotLottieReact
            src="https://lottie.host/f5dd6dde-bf6a-436e-9952-64fb0a79ec12/QClH8BPCiv.lottie"
            loop
            autoplay
            className="w-72 h-72"
            />
        </div>
        </div>


        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 px-4">
        <FeatureCard
            icon={<FaBell size={50} className="text-yellow-400 mb-4" />}
            title="Notify Garbage"
            desc="Users can easily notify authorities about garbage that needs pickup with just one tap."
            image={instantResultsImage}
            className="bg-gradient-to-tr from-purple-900 via-purple-800 to-black text-white hover:shadow-2xl transition duration-300 ease-in-out p-6 rounded-2xl border border-yellow-500"
            />

            <FeatureCard
            icon={<FaMapMarkerAlt size={50} className="text-green-400 mb-4" />}
            title="Location-Based Collection"
            desc="Garbage collectors get real-time tasks based on reported locations nearby."
            image={locationImage}
            className="bg-gradient-to-tr from-purple-900 via-purple-800 to-black text-white hover:shadow-2xl transition duration-300 ease-in-out p-6 rounded-2xl border border-green-500"
            />

            <FeatureCard
            icon={<FaTruck size={50} className="text-blue-400 mb-4" />}
            title="Efficient Pickup"
            desc="Collectors confirm, pass, or mark garbage as picked directly from the dashboard."
            image={pickupImage}
            className="bg-gradient-to-tr from-purple-900 via-purple-800 to-black text-white hover:shadow-2xl transition duration-300 ease-in-out p-6 rounded-2xl border border-blue-500"
            />

        </div>


        {/* Educational Section */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col lg:flex-row items-center bg-opacity-20 p-8 rounded-3xl mb-16 shadow-2xl border-2 border-purple-500">
          <img
            src={recyclingInfoImage}
            alt="Recycling Info"
            className="w-full lg:w-1/2 h-72 object-cover rounded-xl shadow-lg mb-6 lg:mb-0 lg:mr-6"
          />
          <div>
            <h2 className="text-3xl font-semibold text-yellow-300 mb-4">Why Waste Segregation Matters</h2>
            <p className="text-gray-100 text-lg">
              Effective waste segregation reduces pollution, improves recycling, and promotes a cleaner future. Be the change starting today!
            </p>
          </div>
        </motion.div>

        {/* Garbage Collection Vans Section */}
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 bg-opacity-80 p-6 rounded-3xl mb-16 shadow-2xl border border-gray-700 hover:shadow-yellow-400/30 transition duration-300 group">
        <h3 className="text-4xl font-extrabold mb-5 text-yellow-300 group-hover:underline underline-offset-4">
            Real-time Awareness
        </h3>

        <div className="overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105">
            <img
            src={garbageCollectionImage}
            alt="Garbage Collector Van"
            className="object-cover w-full h-64 rounded-2xl"
            />
        </div>

        <p className="text-gray-200 mt-6 leading-relaxed text-md font-light">
            Stay informed with how your neighborhood manages waste. 🚛<br />
            Garbage collection vans now come with <span className="text-green-400 font-medium">GPS tracking</span> and digital awareness boards to promote responsible disposal!
        </p>

        <div className="absolute top-0 right-0 bg-yellow-500 text-black px-3 py-1 text-xs font-bold rounded-bl-xl rounded-tr-3xl shadow-md">
            Live Update
        </div>
        </div>


        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-6 justify-center mb-20">
            {!isLoggedIn ? (
                <>
                <Link to="/login">
                    <button className="bg-yellow-600 text-white h-16 px-6 py-2 rounded-full shadow-md font-bold hover:bg-yellow-800 transition duration-300 cursor-pointer">
                    Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="bg-green-600 text-white h-16 px-6 py-2 rounded-full shadow-md font-bold hover:bg-green-800 transition duration-300 cursor-pointer">
                    Sign Up
                    </button>
                </Link>
                </>
            ) : (
                <Link 
                to={role === 'admin' ? "/admin-dashboard" : "/dashboard"}>
                <button className="bg-purple-600 text-white h-16 px-8 py-2 rounded-full shadow-lg font-bold hover:bg-purple-700 transition duration-300 cursor-pointer">
                    Go to Dashboard
                </button>
                </Link>
            )}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-white mb-6">What Users Are Saying</h2>
          <p className="text-lg text-gray-200 mb-4 italic">
            "I used to be confused about waste. This app is like having a personal eco-assistant!"
          </p>
          <p className="text-lg text-gray-200 mb-4 italic">
            "From AI support to local rules, it's the perfect solution for responsible waste disposal."
          </p>
        </div>

        {/* Footer */}
        <footer className="w-full text-center py-8 bg-gradient-to-r from-purple-600 to-indigo-800 text-white rounded-xl shadow-2xl">
            <div className="container mx-auto px-4">
                <p className="text-lg sm:text-xl mb-4 opacity-80">&copy; 2025 Waste Segregation Helper. All Rights Reserved.</p>
                <div className="flex justify-center space-x-10 text-lg sm:text-xl opacity-90">
                <a href="#" className="hover:text-yellow-400 transition-all duration-300 ease-in-out transform hover:scale-105">
                    Privacy Policy
                </a>
                <a href="#" className="hover:text-yellow-400 transition-all duration-300 ease-in-out transform hover:scale-105">
                    Contact
                </a>
                <a href="#" className="hover:text-yellow-400 transition-all duration-300 ease-in-out transform hover:scale-105">
                    Social Media
                </a>
                </div>
            </div>
            </footer>

      </motion.div>
    </div>
  );
}

// Subcomponent for Feature Cards
const FeatureCard = ({ icon, title, desc, image, className }) => (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-white">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      {icon}
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{desc}</p>
    </div>
  );
  