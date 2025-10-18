const API_BASE_URL = 'https://d13b671458ce.ngrok-free.app';

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

// Vehicle enlist
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
