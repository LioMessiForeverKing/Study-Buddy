'use server';

import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import type { Provider } from '@supabase/supabase-js'; // Import the Provider type

const SignInWith = (provider: Provider) => async () => {
  const supabase = await createClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  console.log(data);
  if (error) {
    console.error('OAuth sign in error:', error);
  }
  redirect(data.url)
};

const signInWithGoogle = SignInWith('google');

export { signInWithGoogle };
