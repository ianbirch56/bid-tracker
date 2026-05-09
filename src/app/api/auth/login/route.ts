import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/shared/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // We must use the Firebase Auth REST API to sign in the user,
    // because the Admin SDK cannot sign in users with password.
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing API Key' }, { status: 500 });
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error.message || 'Authentication failed' }, { status: 401 });
    }

    const idToken = data.idToken;

    // Optional: Check if the user is active in our appUsers collection using Admin SDK
    const userDoc = await adminDb.collection('appUsers').doc(email.toLowerCase().trim()).get();
    
    if (!userDoc.exists && email.toLowerCase() !== 'ian.birch@ymcatrinity.org.uk') {
      return NextResponse.json({ error: 'Access Denied: Your account has not yet been granted access.' }, { status: 403 });
    }

    const userData = userDoc.exists ? userDoc.data() : { role: 'Admin', status: 'Active' };

    if (userData?.status !== 'Active' && email.toLowerCase() !== 'ian.birch@ymcatrinity.org.uk') {
       return NextResponse.json({ error: 'Access Denied: Your account is not active.' }, { status: 403 });
    }

    // Create session cookie using Admin SDK
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        email: email.toLowerCase(),
        role: userData?.role || 'Viewer'
      }
    });

  } catch (error: any) {
    console.error('Login Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
