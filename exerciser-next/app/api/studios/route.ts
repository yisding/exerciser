import { NextRequest, NextResponse } from 'next/server';
import { getStudios, getStudiosByBrand } from '../../../lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');

    // Get studios from database
    const studios = brand ? await getStudiosByBrand(brand) : await getStudios();

    return NextResponse.json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch studios',
      },
      { status: 500 }
    );
  }
}
