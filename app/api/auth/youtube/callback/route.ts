import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCode } from '@/lib/youtubeUploader'
import { saveYouTubeTokens } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({
        error: 'No authorization code provided'
      }, { status: 400 })
    }

    const tokens = await getTokenFromCode(code)
    saveYouTubeTokens(tokens)

    // Redirect back to home page
    return NextResponse.redirect(new URL('/', req.url))

  } catch (error: any) {
    console.error('YouTube auth callback error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
