import React, { useState, useEffect } from 'react';
import DriverLeafletMap from '../../components/driverLeaflet';
import DriverNavbar from '../../components/navbarDriver';
import { getActiveLocations } from '../../apis/garbageApi';

const DriverIntegrate = ({ driver, garbageDumps }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const locationsData = await getActiveLocations();
      const named = (locationsData || []).map((loc) => ({
        ...loc,
        id: loc._id,
        name: loc.locationName || 'Unnamed Garbage',
        lat: loc.lat,
        long: loc.long,
        lng: loc.long,
        active: loc.active,
        userId: loc.markedBy,
        timestamp: loc.createdAt
      }));
      setLocations(named);
      console.log('📦 Fetched active locations:', named.length);
    } catch (err) {
      console.error("Error fetching active locations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLocations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen bg-gradient-to-br from-slate-100 to-blue-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-gradient-to-br from-slate-100 to-blue-100">
      {/* Left Sidebar - Navbar */}
      <div className="w-[380px] h-full border-r border-gray-200 bg-white overflow-y-auto shadow-lg">
        <DriverNavbar locations={locations} setLocations={setLocations} />
      </div>
      
      {/* Right Side - Map */}
      <div className="flex-1 h-full overflow-hidden">
        <DriverLeafletMap 
          driver={driver} 
          locations={locations} 
          setLocations={setLocations}
          garbageDumps={garbageDumps}
          activePickupLocations={locations}  // Pass locations as activePickupLocations
        />
      </div>
    </div>
  );
};

export default DriverIntegrate;