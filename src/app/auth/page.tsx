'use client';

import React, { FC } from 'react';
import { signInWithGoogle } from '../../../utils/action';

interface AuthFormProps {
  // Define any prop types if needed
}

const AuthForm: FC<AuthFormProps> = () => {
  return (
    <div className="z-50">
      <button 
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2 px-4 py-2 text-white bg-[#4285F4] hover:bg-[#357ABD] rounded-lg transition-colors"
      >
        <img src="/google.svg" alt="Google logo" className="w-5 h-5" />
        Sign in with Google
      </button>
    </div>
  );
};

export default AuthForm;
