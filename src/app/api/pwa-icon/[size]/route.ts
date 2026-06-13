import { generateIcon } from '@/lib/utils/generate-icon';
import { NextRequest, NextResponse } from 'next/server';

const VALID_SIZES = new Set([192, 512]);

export async function GET(
  _req: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size, 10);
  if (!VALID_SIZES.has(size)) {
    return new NextResponse('Not found', { status: 404 });
  }
  return generateIcon(size);
}
