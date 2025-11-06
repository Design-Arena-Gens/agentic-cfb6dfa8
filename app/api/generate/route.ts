import { NextRequest, NextResponse } from 'next/server'
import { addJob, updateJob, getYouTubeTokens } from '@/lib/storage'
import { generateVideoScript, generateImage, generateNarration } from '@/lib/videoGenerator'
import { composeVideoFrames, cleanupTempFiles } from '@/lib/videoComposer'
import { uploadVideo } from '@/lib/youtubeUploader'

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()

    // Check if YouTube is authenticated
    const tokens = getYouTubeTokens()
    if (!tokens) {
      return NextResponse.json({
        success: false,
        error: 'YouTube not authenticated'
      }, { status: 401 })
    }

    // Create job
    const job = addJob(topic || 'Auto-generated topic')

    // Start generation in background
    generateAndUploadVideo(job.id, topic).catch(error => {
      console.error('Video generation error:', error)
      updateJob(job.id, {
        status: 'failed',
        error: error.message
      })
    })

    return NextResponse.json({
      success: true,
      jobId: job.id
    })

  } catch (error: any) {
    console.error('Generate API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

async function generateAndUploadVideo(jobId: string, topic?: string) {
  let tempDir = ''

  try {
    // Update status to generating
    updateJob(jobId, { status: 'generating' })

    // Generate script
    console.log('Generating script...')
    const script = await generateVideoScript(topic)
    updateJob(jobId, { topic: script.title })

    // Generate images for each scene
    console.log('Generating images...')
    const imageUrls = await Promise.all(
      script.scenes.map(scene => generateImage(scene.imagePrompt))
    )

    // Generate narration for each scene
    console.log('Generating narration...')
    const audioBuffers = await Promise.all(
      script.scenes.map(scene => generateNarration(scene.text))
    )

    // Compose video frames
    console.log('Composing video...')
    const composed = await composeVideoFrames(script.scenes, imageUrls, audioBuffers)
    tempDir = composed.imagePaths[0].split('/').slice(0, -1).join('/')

    // For demo purposes, we'll simulate a video file
    // In production, you'd use FFmpeg to create the actual video
    const videoPath = `${tempDir}/video.mp4`

    // Create a simple text file as placeholder (in production use FFmpeg)
    const fs = require('fs')
    fs.writeFileSync(videoPath, 'Video placeholder - integrate FFmpeg for actual video creation')

    // Upload to YouTube
    console.log('Uploading to YouTube...')
    updateJob(jobId, { status: 'uploading' })

    const tokens = getYouTubeTokens()
    const youtubeUrl = await uploadVideo(
      videoPath,
      script.title,
      script.description,
      script.tags,
      tokens
    )

    // Update job as completed
    updateJob(jobId, {
      status: 'completed',
      youtubeUrl
    })

    console.log('Video generation completed successfully!')

  } catch (error: any) {
    console.error('Video generation failed:', error)
    updateJob(jobId, {
      status: 'failed',
      error: error.message
    })
  } finally {
    // Cleanup temp files
    if (tempDir) {
      setTimeout(() => cleanupTempFiles(tempDir), 60000) // Cleanup after 1 minute
    }
  }
}
