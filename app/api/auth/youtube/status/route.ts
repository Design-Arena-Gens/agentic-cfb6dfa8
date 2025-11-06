import { NextResponse } from 'next/server'
import { getYouTubeTokens } from '@/lib/storage'

export async function GET() {
  try {
    const tokens = getYouTubeTokens()
    return NextResponse.json({
      authenticated: !!tokens
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
