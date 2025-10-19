'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllVehicles, Vehicle } from '../../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{email: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const API_BASE_URL = 'https://c307bfac7fff.ngrok-free.app';

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (!token || !role || !email) {
      router.push('/auth');
      return;
    }

    setUser({ email, role });
    setLoading(false);
    
    // Load vehicles after user is authenticated
    loadVehicles();
  }, [router]);

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    setVehiclesError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle/retrieve/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Handle the specific API response format
      let vehiclesData = [];
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        vehiclesData = result.data;
      } else {
        console.log('Unexpected API response format:', result);
        vehiclesData = [];
      }
      
      setVehicles(vehiclesData);
    } catch (error) {
      setVehiclesError(error instanceof Error ? error.message : 'Failed to load vehicles');
      console.error('Error loading vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Re-Rent</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You are successfully authenticated as a <span className="font-semibold text-blue-600">{user?.role}</span>
            </p>
            
            {/* Vehicles Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.role === 'owner' ? 'My Vehicles' : 'Available Vehicles'}
                </h2>
                <button
                  onClick={loadVehicles}
                  disabled={vehiclesLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {vehiclesLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {vehiclesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600">Error loading vehicles: {vehiclesError}</p>
                </div>
              )}

              {vehiclesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No vehicles found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.vehicleId} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">License:</span> {vehicle.licencePlateNumber}</p>
                        <p><span className="font-medium">Color:</span> {vehicle.colour}</p>
                        <p><span className="font-medium">Transmission:</span> {vehicle.transmission}</p>
                        <p><span className="font-medium">Fuel:</span> {vehicle.fuelType}</p>
                        <p><span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()} km</p>
                        <p><span className="font-medium">Location:</span> {vehicle.currentLocation || 'Not specified'}</p>
                        <p><span className="font-medium">Price:</span> ${vehicle.rentalPricePerDayUsd}/day</p>
                        {vehicle.depositRequiredUsd > 0 && (
                          <p><span className="font-medium">Deposit:</span> ${vehicle.depositRequiredUsd}</p>
                        )}
                      </div>

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {vehicle.features.map((feature, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            ${vehicle.rentalPricePerDayUsd}/day
                          </span>
                          {user?.role === 'renter' && vehicle.available && (
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.role === 'owner' ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Add Vehicle</h3>
                    <p className="text-gray-600">List a new vehicle for rent</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Bookings</h3>
                    <p className="text-gray-600">View and manage rental bookings</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Earnings</h3>
                    <p className="text-gray-600">Track your rental income</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Search Vehicles</h3>
                    <p className="text-gray-600">Find vehicles by location and type</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
                    <p className="text-gray-600">View your current and past rentals</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Favorites</h3>
                    <p className="text-gray-600">Save vehicles you're interested in</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
