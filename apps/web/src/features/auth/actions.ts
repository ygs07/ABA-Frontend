'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(
  token: string,
  role: string = 'Customer',
  rememberMe = false,
) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'aba_auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
  
  // Storing role in a non-httpOnly cookie allows middleware to route correctly
  // based on role without decoding JWTs (in mock mode).
  cookieStore.set({
    name: 'aba_auth_role',
    value: role,
    httpOnly: false, // UI can read this if necessary
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('aba_auth_token');
  cookieStore.delete('aba_auth_role');
}
