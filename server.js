const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Import scheduler after app is ready
let startScheduler

app.prepare().then(() => {
  // Import scheduler functions
  const schedulerModule = require('./lib/scheduler')
  startScheduler = schedulerModule.startScheduler

  // Start the scheduler
  const generateVideo = async () => {
    try {
      const { addJob, updateJob, getYouTubeTokens } = require('./lib/storage')
      const { generateVideoScript, generateImage, generateNarration } = require('./lib/videoGenerator')
      const { composeVideoFrames, cleanupTempFiles } = require('./lib/videoComposer')
      const { uploadVideo } = require('./lib/youtubeUploader')

      const tokens = getYouTubeTokens()
      if (!tokens) {
        console.error('Cannot generate video: YouTube not authenticated')
        return
      }

      const job = addJob('Scheduled daily video')
      updateJob(job.id, { status: 'generating' })

      const script = await generateVideoScript()
      updateJob(job.id, { topic: script.title })

      const imageUrls = await Promise.all(
        script.scenes.map(scene => generateImage(scene.imagePrompt))
      )

      const audioBuffers = await Promise.all(
        script.scenes.map(scene => generateNarration(scene.text))
      )

      const composed = await composeVideoFrames(script.scenes, imageUrls, audioBuffers)
      const tempDir = composed.imagePaths[0].split('/').slice(0, -1).join('/')
      const videoPath = `${tempDir}/video.mp4`

      const fs = require('fs')
      fs.writeFileSync(videoPath, 'Video placeholder')

      updateJob(job.id, { status: 'uploading' })

      const youtubeUrl = await uploadVideo(
        videoPath,
        script.title,
        script.description,
        script.tags,
        tokens
      )

      updateJob(job.id, {
        status: 'completed',
        youtubeUrl
      })

      setTimeout(() => cleanupTempFiles(tempDir), 60000)
    } catch (error) {
      console.error('Scheduled video generation failed:', error)
    }
  }

  startScheduler(generateVideo)

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
