import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/youtubeUploader'

export async function GET() {
  try {
    const authUrl = getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
