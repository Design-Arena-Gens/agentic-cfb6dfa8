import { NextResponse } from 'next/server'
import { getJobs } from '@/lib/storage'

export async function GET() {
  try {
    const jobs = getJobs()
    return NextResponse.json({ jobs })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
