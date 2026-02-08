import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Enhanced in-memory rate limiter with automatic cleanup
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  let deletedCount = 0;

  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime + RATE_LIMIT_WINDOW) {
      rateLimit.delete(key);
      deletedCount++;
    }
  }

  lastCleanup = now;
  if (deletedCount > 0) {
    console.log(`[Rate Limiter] Cleaned up ${deletedCount} expired entries`);
  }
}

function checkRateLimit(identifier) {
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredEntries();
  }

  const userRequests = rateLimit.get(identifier) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  // Reset if window has passed
  if (now > userRequests.resetTime) {
    userRequests.count = 0;
    userRequests.resetTime = now + RATE_LIMIT_WINDOW;
  }

  userRequests.count++;
  rateLimit.set(identifier, userRequests);

  // Emergency cleanup if Map grows too large
  if (rateLimit.size > 10000) {
    console.warn(`[Rate Limiter] Emergency cleanup triggered at ${rateLimit.size} entries`);
    cleanupExpiredEntries();
  }

  return {
    allowed: userRequests.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - userRequests.count),
    resetTime: userRequests.resetTime
  };
}

// Safely extract client IP from headers (Vercel provides x-forwarded-for)
function getClientIP(request) {
  // On Vercel, x-forwarded-for is trustworthy
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Fallback for local development
  return 'unknown';
}

export async function GET(request) {
  try {
    // Rate limiting with secure IP extraction
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const galleryPath = path.join(process.cwd(), 'public', 'images', 'gallery');

    // Check if directory exists
    if (!fs.existsSync(galleryPath)) {
      return NextResponse.json({ images: [] });
    }

    // Read all files from the gallery folder
    const files = fs.readdirSync(galleryPath);

    // Filter for image files only
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => `/images/gallery/${encodeURIComponent(file)}`);

    return NextResponse.json(
      { images },
      {
        headers: {
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      }
    );
  } catch (error) {
    // Sanitized error message (don't expose internal paths)
    return NextResponse.json(
      { error: 'Unable to load gallery images' },
      { status: 500 }
    );
  }
}
