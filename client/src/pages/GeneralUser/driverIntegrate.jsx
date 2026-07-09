import React, { useState, useEffect } from 'react';
import DriverLeafletMap from '../../components/driverLeaflet';
import DriverNavbar from '../../components/navbarDriver';
import { getActiveLocations, getAllGarbageDumps } from '../../apis/garbageApi';
import { showErrorToast } from '../../utils/showErrorToast';

const DriverIntegrate = () => {
  const [locations, setLocations] = useState([]);
  const [garbageDumps, setGarbageDumps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const data = await getActiveLocations();
      const locationsData = data.locations || []
      const named = (locationsData || []).map((loc) => ({
        ...loc,
        id: loc._id,
        locationName: loc.locationName || 'Unnamed Garbage',
        lat: loc.lat,
        long: loc.long,
        lng: loc.long,
        active: loc.active,
        userId: loc.markedBy,
        updatedAt: loc.updatedAt
      }));
      setLocations(named);
    } catch (error) {
      if(import.meta.env.DEV){
        console.error("Error fetching active locations", error);
      }
      showErrorToast(error);
    }
  };

  const fetchGarbageDumps = async () => {
    try {
      const data = await getAllGarbageDumps();
      setGarbageDumps(data?.data || []);
    } catch (error) {
      if(import.meta.env.DEV){
        console.error("Error fetching garbage dumps:", error);
      }
      showErrorToast(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      await Promise.all([
        fetchLocations(),
        fetchGarbageDumps(),
      ]);

      setIsLoading(false);
    };

    loadData();
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
          pickupLocations={locations} 
          setPickupLocations={setLocations}
          garbageDumps={garbageDumps}
        />
      </div>
    </div>
  );
};

export default DriverIntegrate;