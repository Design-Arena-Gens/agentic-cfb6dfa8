import OpenAI from 'openai'
import Replicate from 'replicate'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build'
  })
}

function getReplicateClient() {
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || 'dummy-key-for-build'
  })
}

export interface VideoScript {
  title: string
  description: string
  script: string
  tags: string[]
  scenes: Scene[]
}

export interface Scene {
  text: string
  imagePrompt: string
  duration: number
}

export async function generateVideoScript(topic?: string): Promise<VideoScript> {
  const openai = getOpenAIClient()
  const niche = process.env.VIDEO_NICHE || 'interesting facts and knowledge'
  const prompt = topic
    ? `Create a detailed video script about: ${topic}`
    : `Create a detailed video script about ${niche}. Choose a trending and engaging topic.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a viral video content creator. Create engaging video scripts that are 60-90 seconds long.
Return a JSON object with this structure:
{
  "title": "Catchy video title",
  "description": "SEO-optimized description",
  "script": "Full narration script",
  "tags": ["tag1", "tag2", "tag3"],
  "scenes": [
    {
      "text": "Narration for this scene",
      "imagePrompt": "Detailed prompt for AI image generation",
      "duration": 5
    }
  ]
}
The script should be engaging, informative, and perfect for short-form content.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' }
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No content generated')

  return JSON.parse(content) as VideoScript
}

export async function generateImage(prompt: string): Promise<string> {
  const replicate = getReplicateClient()
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: "ugly, blurry, low quality, distorted",
          width: 1024,
          height: 576,
          num_outputs: 1
        }
      }
    ) as string[]

    return output[0]
  } catch (error) {
    console.error('Replicate error, falling back to placeholder:', error)
    return `https://via.placeholder.com/1024x576/1a1a2e/ffffff?text=${encodeURIComponent(prompt.slice(0, 50))}`
  }
}

export async function generateNarration(text: string): Promise<Buffer> {
  const openai = getOpenAIClient()
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    return buffer
  } catch (error) {
    console.error('Error generating narration:', error)
    throw error
  }
}
