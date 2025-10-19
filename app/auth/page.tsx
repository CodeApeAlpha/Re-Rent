'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { googleSignIn, GoogleSignInData } from '../../lib/api';

// Callback function to handle Google Sign-In response
function callbackend(response: any, setAuthResult: (result: string) => void, setIsLoading: (loading: boolean) => void, role: string, authType: string, navigate: (path: string) => void) {
  console.log('Google Sign-In response:', response);
  
  if (response.credential) {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const email = payload.email;
      const accessToken = response.credential;
      
      console.log('User email:', email);
      console.log('JWT Token:', accessToken);
      console.log('Auth type:', authType);
      
      // Prepare data for backend API
      const googleData: GoogleSignInData = {
        email: email,
        accessToken: accessToken,
        role: role
      };
      
      setIsLoading(true);
      
      // Call the backend API
      googleSignIn(googleData)
        .then(result => {
          console.log('Backend response:', result);
          const action = authType === 'register' ? 'Registration' : 'Login';
          setAuthResult(`✅ ${action} successful! Status: ${result.statusCode}, Message: ${result.message}`);
          setIsLoading(false);
          
          // Store access token and user data
          localStorage.setItem('accessToken', result.accessToken || accessToken);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userEmail', email);
          
          // Navigate to dashboard after successful auth
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        })
        .catch(error => {
          console.error('Auth failed:', error);
          const action = authType === 'register' ? 'Registration' : 'Login';
          setAuthResult(`❌ ${action} failed: ${error.message}`);
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
  const router = useRouter();
  const [authResult, setAuthResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('owner');
  const [authType, setAuthType] = useState<string>(''); // 'register' or 'signin'
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = auth type, 2 = role (if register), 3 = sign in
  const [isGoogleReady, setIsGoogleReady] = useState<boolean>(false);
  const selectedRoleRef = useRef(selectedRole);
  const authTypeRef = useRef(authType);

  // Update refs when values change
  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  useEffect(() => {
    authTypeRef.current = authType;
  }, [authType]);

  // Preload Google Sign-In in background
  useEffect(() => {
    const checkGoogleReady = () => {
      if ((window as any).google && (window as any).google.accounts) {
        setIsGoogleReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkGoogleReady()) {
      // Poll every 200ms until ready
      const interval = setInterval(() => {
        if (checkGoogleReady()) {
          clearInterval(interval);
        }
      }, 200);

      // Cleanup after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (!isGoogleReady) {
          console.warn('Google Sign-In script failed to load');
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isGoogleReady]);

  // Initialize Google Sign-In when moving to final step
  useEffect(() => {
    const finalStep = authType === 'register' ? 3 : 2;
    if (currentStep === finalStep && isGoogleReady) {
      // Register callback
      (window as any).callbackend = (response: any) => {
        callbackend(response, setAuthResult, setIsLoading, selectedRoleRef.current, authTypeRef.current, router.push);
      };

      // Initialize Google Sign-In
      (window as any).google.accounts.id.initialize({
        client_id: "511958194055-ur4ksh5a79b7btap9pick8heh4tl5gu9.apps.googleusercontent.com",
        callback: (window as any).callbackend,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        (window as any).google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left"
        });
      }
    }

    return () => {
      const finalStep = authType === 'register' ? 3 : 2;
      if (currentStep === finalStep && (window as any).google && (window as any).google.accounts) {
        (window as any).google.accounts.id.cancel();
      }
    };
  }, [currentStep, isGoogleReady, authType]);

  const handleAuthTypeNext = () => {
    if (authType === 'register') {
      setCurrentStep(2); // Go to role selection
    } else if (authType === 'signin') {
      setCurrentStep(2); // Go directly to sign in
    }
  };

  const handleRoleNext = () => {
    if (selectedRole) {
      setCurrentStep(3); // Go to Google sign in
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && authType === 'register') {
      setCurrentStep(1); // Back to auth type selection
    } else if (currentStep === 2 && authType === 'signin') {
      setCurrentStep(1); // Back to auth type selection
    } else if (currentStep === 3) {
      setCurrentStep(2); // Back to role selection
    }
    setAuthResult('');
    setIsLoading(false);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setAuthType('');
    setSelectedRole('owner');
    setAuthResult('');
    setIsLoading(false);
  };

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

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/#features" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </Link>
                <Link href="/#how-it-works" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  How it Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center py-12">
        <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authType === 'register' ? 'Join Re-Rent' : authType === 'signin' ? 'Welcome Back' : 'Authentication'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authType === 'register' ? 'Create your account and start earning' : 
             authType === 'signin' ? 'Sign in to your account' : 
             'Welcome to Re-Rent'}
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-lg shadow">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                {authType === 'register' && (
                  <>
                    <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                    </div>
                  </>
                )}
                {authType === 'signin' && (
                  <>
                    <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 1: Auth Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    What would you like to do?
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setAuthType('register');
                        setCurrentStep(1); // Reset to step 1 when switching
                        setAuthResult('');
                        setIsLoading(false);
                      }}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        authType === 'register' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center">
                          {authType === 'register' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <div>
                          <div className="font-medium">Register</div>
                          <div className="text-sm text-gray-500">Create a new account and select your role</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setAuthType('signin');
                        setCurrentStep(1); // Reset to step 1 when switching
                        setAuthResult('');
                        setIsLoading(false);
                      }}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        authType === 'signin' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center">
                          {authType === 'signin' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <div>
                          <div className="font-medium">Sign In</div>
                          <div className="text-sm text-gray-500">Access your existing account</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAuthTypeNext}
                  disabled={!authType}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Role Selection (Only for Register) */}
            {currentStep === 2 && authType === 'register' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="owner">Owner - List and manage your vehicles</option>
                    <option value="renter">Renter - Find and book vehicles</option>
                  </select>
                </div>

                <button
                  onClick={handleRoleNext}
                  disabled={!selectedRole}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2/3: Google Sign-In */}
            {((currentStep === 2 && authType === 'signin') || (currentStep === 3 && authType === 'register')) && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {authType === 'register' ? 'Create your account' : 'Sign in to your account'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {authType === 'register' 
                      ? `Complete your registration as a ${selectedRole === 'owner' ? 'Owner' : 'Renter'}`
                      : 'Continue with Google to access your account'
                    }
                  </p>
                </div>

                {/* Google Sign-In Loading State */}
                {!isGoogleReady && (
                  <div className="flex flex-col items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-sm text-gray-600">Preparing Google Sign-In...</p>
                  </div>
                )}

                {/* Google Sign-In button */}
                <div id="google-signin-button" className="flex justify-center"></div>
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      {authType === 'register' ? 'Creating your account...' : 'Signing you in...'}
                    </p>
                  </div>
                )}
                
                {/* Auth result display */}
                {authResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    authResult.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-sm font-medium text-gray-800">
                      {authResult}
                    </div>
                  </div>
                )}

                {/* Back button */}
                <button
                  onClick={handleBack}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>

                {/* Start Over button */}
                <button
                  onClick={handleStartOver}
                  className="w-full text-gray-500 py-2 px-4 text-sm hover:text-gray-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}