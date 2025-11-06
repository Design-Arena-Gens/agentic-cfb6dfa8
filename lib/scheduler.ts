import cron from 'node-cron'
import { isCronEnabled } from './storage'

let scheduledTask: cron.ScheduledTask | null = null

export function startScheduler(callback: () => Promise<void>) {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *' // Default: 9 AM daily

  if (scheduledTask) {
    scheduledTask.stop()
  }

  scheduledTask = cron.schedule(schedule, async () => {
    if (isCronEnabled()) {
      console.log('Running scheduled video generation...')
      try {
        await callback()
      } catch (error) {
        console.error('Scheduled task error:', error)
      }
    }
  })

  console.log(`Scheduler started with schedule: ${schedule}`)
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('Scheduler stopped')
  }
}

export function getSchedule() {
  return process.env.CRON_SCHEDULE || '0 9 * * *'
}
