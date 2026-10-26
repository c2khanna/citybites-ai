import { NextResponse } from 'next/server';
import { updateRestaurantStatus, deleteRestaurant } from '@/lib/db';
import { verifyAdminPasscode } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminPasscode(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: A curator admin passcode is required to modify restaurants.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const success = await updateRestaurantStatus(id, body);
    if (!success) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdminPasscode(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: A curator admin passcode is required to delete restaurants from the catalog.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const success = await deleteRestaurant(id);
    if (!success) {
      return NextResponse.json({ error: 'Restaurant not found or could not be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
