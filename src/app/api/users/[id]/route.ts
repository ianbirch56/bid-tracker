import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/shared/lib/firebase-admin';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  if (!sessionCookie) return null;
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const email = decodedClaims.email;
    if (!email) return null;
    
    // Check if admin
    if (email.toLowerCase() === 'ian.birch@ymcatrinity.org.uk') return email;
    
    const userDoc = await adminDb.collection('appUsers').doc(email.toLowerCase()).get();
    if (userDoc.exists && userDoc.data()?.role === 'Admin') return email;
    
    return null;
  } catch (e) {
    return null;
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await verifyAdmin();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });

  try {
    const { id } = await params;
    const data = await request.json();
    await adminDb.collection('appUsers').doc(id).set(data, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
