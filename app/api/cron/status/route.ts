import { NextResponse } from 'next/server'
import { isCronEnabled } from '@/lib/storage'
import { getSchedule } from '@/lib/scheduler'

export async function GET() {
  try {
    return NextResponse.json({
      enabled: isCronEnabled(),
      schedule: getSchedule()
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
