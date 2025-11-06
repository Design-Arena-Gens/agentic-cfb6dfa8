import fs from 'fs'
import path from 'path'
import { Scene } from './videoGenerator'

export interface ComposedVideo {
  imagePaths: string[]
  audioPaths: string[]
  duration: number
}

export async function composeVideoFrames(
  scenes: Scene[],
  imageUrls: string[],
  audioBuffers: Buffer[]
): Promise<ComposedVideo> {
  const outputDir = path.join(process.cwd(), 'tmp', 'videos', Date.now().toString())

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const imagePaths: string[] = []
  const audioPaths: string[] = []

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    const imageUrl = imageUrls[i]
    const audioBuffer = audioBuffers[i]

    // For web deployment, we store references to the images
    // In production, integrate with a video editing library or service
    const imagePath = path.join(outputDir, `frame_${i}.txt`)
    fs.writeFileSync(imagePath, JSON.stringify({
      imageUrl,
      text: scene.text,
      duration: scene.duration
    }))
    imagePaths.push(imagePath)

    // Save audio
    const audioPath = path.join(outputDir, `audio_${i}.mp3`)
    fs.writeFileSync(audioPath, audioBuffer)
    audioPaths.push(audioPath)
  }

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0)

  return {
    imagePaths,
    audioPaths,
    duration: totalDuration
  }
}

export function cleanupTempFiles(dirPath: string) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true })
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error)
  }
}
