const API_BASE_URL = 'https://c307bfac7fff.ngrok-free.app';

// Test endpoint
export async function testBackend(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    const data = await response.text();
    return `Status: ${response.status}, Response: ${data}`;
  } catch (error) {
    throw new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Google Sign-In API
export async function googleSignIn(googleData: GoogleSignInData): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Google Sign-In
export interface GoogleSignInData {
  email: string;
  accessToken: string;
  role: string;
}

// Vehicle interfaces
export interface VehicleData {
  licencePlateNumber: string;
  vinNumber: string;
  make: string;
  model: string;
  colour: string;
  fuelType: string;
  transmission: string;
  mileage: number;
}

export interface Vehicle {
  vehicleId: string;
  licencePlateNumber: string;
  vinNumber: string;
  make: string;
  model: string;
  colour: string;
  fuelType: string;
  mileage: number;
  createAt: number[]; // Changed from string to number array
  transmission: string;
  status: string;
  pickupOptions: string | null; // Added null possibility
  airConditioning: boolean;
  rentalPricePerDayUsd: number;
  depositRequiredUsd: number;
  mileageLimitPerDayKm: number;
  features: string[] | null; // Added null possibility
  currentLocation: string | null; // Added null possibility
  available: boolean;
  // Add image URL getter
  getImageUrl: () => string;
}

export async function enlistVehicle(vehicleData: VehicleData): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/enlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    
    const data = await response.text();
    return `Status: ${response.status}, Response: ${data}`;
  } catch (error) {
    throw new Error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Retrieve all vehicles
export async function getAllVehicles(): Promise<Vehicle[]> {
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
    
    return vehiclesData;
  } catch (error) {
    throw new Error(`Error retrieving vehicles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
