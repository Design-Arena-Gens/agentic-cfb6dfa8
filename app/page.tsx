'use client'

import { useState, useEffect } from 'react'

interface VideoJob {
  id: string
  topic: string
  status: 'pending' | 'generating' | 'uploading' | 'completed' | 'failed'
  videoUrl?: string
  youtubeUrl?: string
  error?: string
  createdAt: string
}

export default function Home() {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [customTopic, setCustomTopic] = useState('')
  const [cronStatus, setCronStatus] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchCronStatus()
    checkYouTubeAuth()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  const fetchCronStatus = async () => {
    try {
      const res = await fetch('/api/cron/status')
      const data = await res.json()
      setCronStatus(data)
    } catch (error) {
      console.error('Failed to fetch cron status:', error)
    }
  }

  const checkYouTubeAuth = async () => {
    try {
      const res = await fetch('/api/auth/youtube/status')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Failed to check auth status:', error)
    }
  }

  const generateVideo = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic || undefined })
      })
      const data = await res.json()
      if (data.success) {
        fetchJobs()
        setCustomTopic('')
      } else {
        alert('Failed to start video generation: ' + data.error)
      }
    } catch (error) {
      alert('Error starting video generation')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleCron = async (enable: boolean) => {
    try {
      const res = await fetch('/api/cron/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      })
      const data = await res.json()
      if (data.success) {
        fetchCronStatus()
      }
    } catch (error) {
      alert('Failed to toggle automation')
    }
  }

  const authenticateYouTube = () => {
    window.location.href = '/api/auth/youtube'
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI Video Generator Agent
          </h1>
          <p className="text-gray-300 text-lg">
            Automatically generate and post daily videos to YouTube
          </p>
        </header>

        {/* YouTube Authentication */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">YouTube Authentication</h2>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">Connected to YouTube</span>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">You need to authenticate with YouTube to upload videos</p>
              <button
                onClick={authenticateYouTube}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Connect YouTube Account
              </button>
            </div>
          )}
        </div>

        {/* Automation Control */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Automation Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 mb-2">
                Daily Automation: {cronStatus?.enabled ? (
                  <span className="text-green-400 font-semibold">ENABLED</span>
                ) : (
                  <span className="text-gray-500 font-semibold">DISABLED</span>
                )}
              </p>
              {cronStatus?.schedule && (
                <p className="text-sm text-gray-500">Schedule: {cronStatus.schedule}</p>
              )}
            </div>
            <button
              onClick={() => toggleCron(!cronStatus?.enabled)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                cronStatus?.enabled
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {cronStatus?.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Manual Generation */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Generate Video Now</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Enter custom topic (optional)"
              className="flex-1 px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={generateVideo}
              disabled={isGenerating || !isAuthenticated}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isGenerating || !isAuthenticated
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
          {!isAuthenticated && (
            <p className="text-yellow-500 text-sm mt-2">
              ⚠ Please authenticate with YouTube first
            </p>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Video Generation History</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No videos generated yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.topic}</h3>
                      <p className="text-sm text-gray-400 mb-2">{new Date(job.createdAt).toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-600' :
                          job.status === 'failed' ? 'bg-red-600' :
                          job.status === 'generating' ? 'bg-blue-600' :
                          job.status === 'uploading' ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      {job.error && (
                        <p className="text-red-400 text-sm mt-2">{job.error}</p>
                      )}
                    </div>
                    {job.youtubeUrl && (
                      <a
                        href={job.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        View on YouTube
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
