import { NextRequest, NextResponse } from 'next/server'
import { setCronEnabled } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const { enable } = await req.json()
    setCronEnabled(enable)

    return NextResponse.json({
      success: true,
      enabled: enable
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
