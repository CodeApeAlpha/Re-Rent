'use client';

import { useEffect, useState, useRef } from 'react';
import { googleSignIn, GoogleSignInData } from '../../lib/api';

// Callback function to handle Google Sign-In response
function callbackend(response: any, setAuthResult: (result: string) => void, setIsLoading: (loading: boolean) => void, role: string) {
  console.log('Google Sign-In response:', response);
  
  if (response.credential) {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const email = payload.email;
      const accessToken = response.credential;
      
      console.log('User email:', email);
      console.log('JWT Token:', accessToken);
      
      // Prepare data for backend API
      const googleData: GoogleSignInData = {
        email: email,
        accessToken: accessToken,
        role: role // Use the selected role from dropdown
      };
      
      setIsLoading(true);
      
      // Call the backend API
      googleSignIn(googleData)
        .then(result => {
          console.log('Backend response:', result);
          setAuthResult(`✅ Login successful! Status: ${result.statusCode}, Message: ${result.message}`);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Login failed:', error);
          setAuthResult(`❌ Login failed: ${error.message}`);
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error decoding token:', error);
      setAuthResult(`❌ Error processing Google response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }
}

export default function AuthPage() {
  const [authResult, setAuthResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('owner');
  const selectedRoleRef = useRef(selectedRole);

  // Update ref when selectedRole changes
  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // Initialize Google Sign-In programmatically
  useEffect(() => {
    // Register callback first
    (window as any).callbackend = (response: any) => {
      callbackend(response, setAuthResult, setIsLoading, selectedRoleRef.current);
    };

    // Initialize Google Sign-In after callback is registered
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "511958194055-ur4ksh5a79b7btap9pick8heh4tl5gu9.apps.googleusercontent.com",
          callback: (window as any).callbackend,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "signin_with",
            logo_alignment: "left"
          });
        }
      } else {
        // If Google script hasn't loaded yet, wait and try again
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    // Start initialization
    initializeGoogleSignIn();

    // Cleanup function
    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, []); // Empty dependency array - initialize once
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to Re-Rent
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-lg shadow">
            {/* Role Selection Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="owner">Owner</option>
                <option value="renter">Renter</option>
              </select>
            </div>

            {/* Google Sign-In button will be rendered here programmatically */}
            <div id="google-signin-button" className="flex justify-center"></div>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-sm text-gray-600">Processing login...</p>
              </div>
            )}
            
            {/* Auth result display */}
            {authResult && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <div className="text-sm font-medium text-gray-800">
                  {authResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
