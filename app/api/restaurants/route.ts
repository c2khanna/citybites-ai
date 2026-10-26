import { NextResponse } from 'next/server';
import { getAllRestaurants, addRestaurant } from '@/lib/db';
import { verifyAdminPasscode } from '@/lib/auth';

export async function GET() {
  try {
    const spots = await getAllRestaurants();
    return NextResponse.json(spots);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!verifyAdminPasscode(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: A curator admin passcode is required to add restaurants to the catalog.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }
    const created = await addRestaurant(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
