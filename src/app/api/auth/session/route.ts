import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/shared/lib/firebase-admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    if (!decodedClaims || !decodedClaims.email) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user role
    const email = decodedClaims.email;
    const userDoc = await adminDb.collection('appUsers').doc(email.toLowerCase().trim()).get();
    
    let role = 'Viewer';
    if (userDoc.exists) {
      role = userDoc.data()?.role || 'Viewer';
    } else if (email.toLowerCase() === 'ian.birch@ymcatrinity.org.uk') {
      role = 'Admin';
    }

    return NextResponse.json({ 
      user: {
        uid: decodedClaims.uid,
        email: email,
        displayName: decodedClaims.name || '',
      },
      role: role
    });

  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
