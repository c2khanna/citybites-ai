import { NextResponse } from 'next/server';
import { getAllRestaurants, addRestaurant } from '@/lib/db';

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
