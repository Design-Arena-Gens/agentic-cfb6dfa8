import { google } from 'googleapis'
import fs from 'fs'

const OAuth2 = google.auth.OAuth2

export function getOAuth2Client() {
  return new OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client()

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

export async function getTokenFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function setCredentials(tokens: any) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}

export async function uploadVideo(
  videoPath: string,
  title: string,
  description: string,
  tags: string[],
  tokens: any
): Promise<string> {
  const oauth2Client = setCredentials(tokens)
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const videoMetadata = {
    snippet: {
      title,
      description,
      tags,
      categoryId: '22', // People & Blogs category
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false,
    }
  }

  try {
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoPath)
      }
    })

    const videoId = response.data.id
    return `https://www.youtube.com/watch?v=${videoId}`
  } catch (error: any) {
    console.error('YouTube upload error:', error)
    throw new Error(`Failed to upload to YouTube: ${error.message}`)
  }
}
