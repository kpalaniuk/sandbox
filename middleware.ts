import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporary passthrough middleware — Clerk auth handled at page/API level
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
