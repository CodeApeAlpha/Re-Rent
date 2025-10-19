'use client';
import { useEffect, useState } from 'react';
import { testBackend, enlistVehicle, VehicleData } from '../../lib/api';
import {
  checkPermissionStateAndAct,
  notificationUnsupported,
  registerAndSubscribe,
  sendWebPush,
} from '../Push';

export default function Home() {
  const [unsupported, setUnsupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<string>('');
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    licencePlateNumber: '',
    vinNumber: '',
    make: '',
    model: '',
    colour: '',
    fuelType: '',
    transmission: '',
    mileage: 0
  });
  const [vehicleResult, setVehicleResult] = useState<string>('');

  useEffect(() => {
    const isUnsupported = notificationUnsupported();
    setUnsupported(isUnsupported);
    if (isUnsupported) {
      return;
    }
    checkPermissionStateAndAct(setSubscription);
  }, []);

  // Add offline/online detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Set initial state
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add service worker status logging
  useEffect(() => {
    const checkSWStatus = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration?.active) {
            console.log('✅ Service Worker Status: ACTIVE');
            console.log('SW Scope:', registration.scope);
            console.log('SW State:', registration.active.state);
          } else if (registration?.installing) {
            console.log('⏳ Service Worker Status: INSTALLING');
          } else if (registration?.waiting) {
            console.log('⏸️ Service Worker Status: WAITING');
          } else {
            console.log('❌ Service Worker Status: NOT FOUND');
          }
        } catch (error) {
          console.log('❌ Service Worker Status: ERROR -', error);
        }
      } else {
        console.log('❌ Service Worker Status: NOT SUPPORTED');
      }
    };

    checkSWStatus();
  }, []);

  // Test backend endpoint function
  const handleTestEndpoint = async () => {
    try {
      const result = await testBackend();
      setTestResult(result);
    } catch (error) {
      setTestResult(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Vehicle enlist function
  const handleEnlistVehicle = async () => {
    try {
      const result = await enlistVehicle(vehicleData);
      setVehicleResult(result);
    } catch (error) {
      setVehicleResult(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Handle vehicle input changes
  const handleVehicleInputChange = (field: keyof VehicleData, value: string | number) => {
    setVehicleData((prev: VehicleData) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <main className="p-8">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white p-4 text-center mb-4">
          📡 You're offline - App is running in offline mode
        </div>
      )}
      
      <div className="max-w-md mx-auto">
        <button
          disabled={unsupported}
          onClick={() => registerAndSubscribe(setSubscription)}
          className={`w-full p-4 rounded ${subscription ? 'bg-green-500' : 'bg-blue-500'} text-white`}
        >
          {unsupported
            ? 'Notification Unsupported'
            : subscription
              ? 'Notification allowed'
              : 'Allow notification'}
        </button>
        
        {subscription && (
          <>
            <input
              placeholder="Type push message ..."
              className="w-full p-4 mt-8 border rounded"
              value={message ?? ''}
              onChange={e => setMessage(e.target.value)}
            />
            <button 
              disabled={!isOnline}
              onClick={() => sendWebPush(message)}
              className={`w-full p-4 mt-4 rounded ${!isOnline ? 'bg-gray-400' : 'bg-purple-500'} text-white`}
            >
              {!isOnline ? 'Offline - Cannot send push' : 'Test Web Push'}
            </button>
          </>
        )}
        
        {/* Test Backend Endpoint Button */}
        <button 
          onClick={handleTestEndpoint}
          className="w-full p-4 mt-4 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Test Backend Endpoint
        </button>
        
        {/* Test Result Display */}
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div className="text-sm font-bold mb-2">Test Result:</div>
            <pre className="text-xs">{testResult}</pre>
          </div>
        )}

        {/* Vehicle Enlistment Form */}
        <div className="mt-8 p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Vehicle Enlistment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate Number</label>
              <input
                type="text"
                value={vehicleData.licencePlateNumber}
                onChange={(e) => handleVehicleInputChange('licencePlateNumber', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter license plate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number</label>
              <input
                type="text"
                value={vehicleData.vinNumber}
                onChange={(e) => handleVehicleInputChange('vinNumber', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter VIN number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                value={vehicleData.make}
                onChange={(e) => handleVehicleInputChange('make', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter vehicle make"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={vehicleData.model}
                onChange={(e) => handleVehicleInputChange('model', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter vehicle model"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
              <input
                type="text"
                value={vehicleData.colour}
                onChange={(e) => handleVehicleInputChange('colour', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter vehicle colour"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                value={vehicleData.fuelType}
                onChange={(e) => handleVehicleInputChange('fuelType', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                value={vehicleData.transmission}
                onChange={(e) => handleVehicleInputChange('transmission', e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select transmission</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="semi-automatic">Semi-Automatic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <input
                type="number"
                value={vehicleData.mileage}
                onChange={(e) => handleVehicleInputChange('mileage', parseInt(e.target.value) || 0)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter mileage"
              />
            </div>
          </div>
          
          <button 
            onClick={handleEnlistVehicle}
            className="w-full p-4 mt-6 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
          >
            Enlist Vehicle
          </button>
          
          {/* Vehicle Result Display */}
          {vehicleResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <div className="text-sm font-bold mb-2">Vehicle Enlist Result:</div>
              <pre className="text-xs">{vehicleResult}</pre>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <div className="text-sm font-bold mb-2">Push subscription:</div>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {subscription
            ? JSON.stringify(subscription?.toJSON(), undefined, 2)
            : 'There is no subscription'}
          </pre>
        </div>
      </div>
    </main>
  );
}