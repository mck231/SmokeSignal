// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redisClient } from '@/lib/redis';

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('sessionId')?.value;

  if (!sessionId) {
    // If there's no sessionId cookie, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check if the session exists in Redis
  const session = await redisClient.hGetAll(sessionId);
  if (!session || !session.userId) {
    // Invalid session, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Optionally, you can attach user information to the request headers
  // for use in your pages or API routes
  const userId = session.userId;
  const response = NextResponse.next();
  response.headers.set('x-user-id', userId);

  return response;
}

// Apply middleware to protected routes
export const config = {
  matcher: ['/dashboard/:path*', '/vote/:path*'], // Adjust paths as needed
};
