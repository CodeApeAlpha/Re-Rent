'use client';

import { useEffect } from 'react';

// Callback function to handle Google Sign-In response
function callbackend(response: any) {
  console.log('Google Sign-In response:', response);
  // Handle the authentication response here
  if (response.credential) {
    // Decode the JWT token or handle the credential
    console.log('User signed in successfully');
    console.log('JWT Token:', response.credential);
    // You can decode the JWT token here or send it to your backend
  }
}

export default function AuthPage() {
  // Make the callback function available globally
  useEffect(() => {
    (window as any).callbackend = callbackend;
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
          <div className="p-8 rounded-lg shadow">
          <div id="g_id_onload"
                 data-client_id="511958194055-ur4ksh5a79b7btap9pick8heh4tl5gu9.apps.googleusercontent.com"
                 data-context="signin"
                 data-ux_mode="popup"
                 data-callback="https://c307bfac7fff.ngrok-free.app/google/login"
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
          </div>
        </div>
      </div>
    </main>
  );
}
