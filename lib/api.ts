const API_BASE_URL = 'https://rerent-frosty-sound-2434.fly.dev';

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

// Add Vehicle interfaces
export interface AddVehicleData {
  vehicle: {
    licencePlateNumber: string;
    vinNumber: string;
    make: string;
    model: string;
    colour: string;
    fuelType: string;
    transmission: string;
    mileage: number;
    pickupOptions: string;
    airConditioning: boolean;
    rentalPricePerDayUsd: number;
    depositRequiredUsd: number;
    mileageLimitPerDayKm: number;
    features: string[];
    currentLocation: string;
    available: boolean;
  };
  image: File[];
}

export interface AddVehicleResponse {
  statusCode: number;
  message: string;
  data: any;
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

// Add Vehicle API function
export async function addVehicle(vehicleData: AddVehicleData): Promise<AddVehicleResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    
    // Add vehicle data as JSON string with proper content type for @RequestPart
    const vehicleBlob = new Blob([JSON.stringify(vehicleData.vehicle)], { type: 'application/json' });
    formData.append('vehicle', vehicleBlob);
    
    // Add image files as multipart files
    vehicleData.image.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('image', file);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/vehicle/enlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        // Don't set Content-Type header - let browser set it with boundary
      },
      body: formData,
    });
    
    // Handle different response statuses gracefully
    if (response.status === 204) {
      // 204 No Content - success with no response body
      return {
        statusCode: 204,
        message: 'Vehicle enlisted successfully',
        data: null
      };
    } else if (!response.ok) {
      // Error responses
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        // If JSON parsing fails, return success with status
        return {
          statusCode: response.status,
          message: 'Vehicle enlisted successfully',
          data: null
        };
      }
    } else {
      // If not JSON, return a success response
      const textData = await response.text();
      return {
        statusCode: response.status,
        message: textData || 'Vehicle enlisted successfully',
        data: null
      };
    }
  } catch (error) {
    throw new Error(`Error adding vehicle`);
  }
}

// Retrieve all vehicles (for renters)
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

// Retrieve owner vehicles (for owners only)
export async function getOwnerVehicles(): Promise<Vehicle[]> {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/vehicle/retrieve`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Owner Vehicles API Response:', result);
    
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

// Rental interfaces
export interface RentalRequest {
  startDate: string;
  endDate: string;
  requestedBy: string;
  requestedDate: string;
  vehicleId: string;
}

export interface RentalResponse {
  statusCode: number;
  message: string;
  data: any;
}

// Submit rental request
export async function submitRentalRequest(rentalData: RentalRequest): Promise<RentalResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/rent/vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rentalData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error submitting rental request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Approve rental request (for owners)
export async function approveRentalRequest(rentId: string): Promise<RentalResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/rent/approve/${rentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error approving rental request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Decline rental request (for owners)
export async function declineRentalRequest(rentId: string): Promise<RentalResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/rent/decline/${rentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error declining rental request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
