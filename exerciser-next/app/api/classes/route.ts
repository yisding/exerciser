import { NextRequest, NextResponse } from 'next/server';
import { getClasses } from '../../../lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};

    const studioId = searchParams.get('studioId');
    if (studioId) filters.studioId = studioId;

    const brand = searchParams.get('brand');
    if (brand) filters.brand = brand;

    const startDate = searchParams.get('startDate');
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get('endDate');
    if (endDate) filters.endDate = new Date(endDate);

    const className = searchParams.get('className');
    if (className) filters.className = className;

    const instructor = searchParams.get('instructor');
    if (instructor) filters.instructor = instructor;

    // Get classes from database
    const classes = await getClasses(filters);

    return NextResponse.json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch classes',
      },
      { status: 500 }
    );
  }
}
