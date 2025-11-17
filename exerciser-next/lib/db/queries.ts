import { prisma } from './client';

export interface ClassFilters {
  studioId?: string;
  brand?: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
  instructor?: string;
}

/**
 * Get fitness classes with optional filters
 */
export async function getClasses(filters: ClassFilters = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.studioId) {
    where.studioId = filters.studioId;
  }

  if (filters.brand) {
    where.studio = {
      brand: filters.brand,
    };
  }

  if (filters.startDate || filters.endDate) {
    where.startTime = {};
    if (filters.startDate) {
      where.startTime.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startTime.lte = filters.endDate;
    }
  }

  if (filters.className) {
    where.className = {
      contains: filters.className,
      mode: 'insensitive',
    };
  }

  if (filters.instructor) {
    where.instructor = {
      contains: filters.instructor,
      mode: 'insensitive',
    };
  }

  return prisma.fitnessClass.findMany({
    where,
    include: {
      studio: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

/**
 * Get all studios
 */
export async function getStudios() {
  return prisma.studio.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Get studios by brand
 */
export async function getStudiosByBrand(brand: string) {
  return prisma.studio.findMany({
    where: { brand },
    orderBy: {
      name: 'asc',
    },
  });
}
