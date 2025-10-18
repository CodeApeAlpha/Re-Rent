'use client';

import { useEffect, useState } from 'react';
import { googleSignIn, GoogleSignInData } from '../../lib/api';

// Callback function to handle Google Sign-In response
function callbackend(response: any, setAuthResult: (result: string) => void, setIsLoading: (loading: boolean) => void) {
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
        role: 'user' // Default role, can be customized based on your logic
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

  // Make the callback function available globally
  useEffect(() => {
    (window as any).callbackend = (response: any) => {
      callbackend(response, setAuthResult, setIsLoading);
    };
  }, []);
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
            <div id="g_id_onload"
                 data-client_id="511958194055-ur4ksh5a79b7btap9pick8heh4tl5gu9.apps.googleusercontent.com"
                 data-context="signin"
                 data-ux_mode="popup"
                 data-callback="callbackend"
                 data-auto_prompt="false">
            </div>

            <div className="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="signin_with"
                 data-size="large"
                 data-logo_alignment="left">
            </div>
            
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
