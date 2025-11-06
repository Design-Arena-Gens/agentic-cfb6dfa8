import fs from 'fs'
import path from 'path'

export interface VideoJob {
  id: string
  topic: string
  status: 'pending' | 'generating' | 'uploading' | 'completed' | 'failed'
  videoUrl?: string
  youtubeUrl?: string
  error?: string
  createdAt: string
}

export interface AppState {
  jobs: VideoJob[]
  youtubeTokens?: any
  cronEnabled: boolean
}

const STORAGE_PATH = path.join(process.cwd(), 'data', 'state.json')

function ensureStorageDir() {
  const dir = path.dirname(STORAGE_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function loadState(): AppState {
  ensureStorageDir()

  if (!fs.existsSync(STORAGE_PATH)) {
    const initialState: AppState = {
      jobs: [],
      cronEnabled: false
    }
    saveState(initialState)
    return initialState
  }

  try {
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading state:', error)
    return {
      jobs: [],
      cronEnabled: false
    }
  }
}

export function saveState(state: AppState) {
  ensureStorageDir()
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2))
}

export function addJob(topic: string): VideoJob {
  const state = loadState()
  const job: VideoJob = {
    id: Date.now().toString(),
    topic,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  state.jobs.unshift(job)
  saveState(state)
  return job
}

export function updateJob(id: string, updates: Partial<VideoJob>) {
  const state = loadState()
  const index = state.jobs.findIndex(j => j.id === id)
  if (index !== -1) {
    state.jobs[index] = { ...state.jobs[index], ...updates }
    saveState(state)
  }
}

export function getJobs(): VideoJob[] {
  return loadState().jobs
}

export function saveYouTubeTokens(tokens: any) {
  const state = loadState()
  state.youtubeTokens = tokens
  saveState(state)
}

export function getYouTubeTokens(): any | null {
  const state = loadState()
  return state.youtubeTokens || null
}

export function setCronEnabled(enabled: boolean) {
  const state = loadState()
  state.cronEnabled = enabled
  saveState(state)
}

export function isCronEnabled(): boolean {
  return loadState().cronEnabled
}
