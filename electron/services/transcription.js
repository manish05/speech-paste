import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from './keychain.js';
import { DEFAULT_MODEL } from '../config.js';
import { log } from '../utils/logger.js';

/**
 * Transcribes audio using Gemini AI with structured output
 * @param {string} base64Audio - Base64 encoded audio data
 * @param {string} mimeType - MIME type of the audio
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeWithGemini(base64Audio, mimeType) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Open Settings to add it.');
  }
  
  log(`Starting transcription with mimeType: ${mimeType}, data length: ${base64Audio.length}`, 'info');
  
  // Validate audio format - Gemini supports specific formats
  const supportedFormats = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/ogg;codecs=opus'
  ];
  
  if (!supportedFormats.includes(mimeType)) {
    log(`Unsupported mimeType: ${mimeType}. Supported formats: ${supportedFormats.join(', ')}`, 'warn');
    // Try to convert or use a fallback format
    mimeType = 'audio/webm;codecs=opus';
    log(`Using fallback mimeType: ${mimeType}`, 'info');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
  
  try {
    log('Attempting transcription with Gemini...', 'info');
    
    // Use the correct format for Gemini API with audio data
    const result = await model.generateContent([
      "Transcribe the spoken audio into plain text. Provide only the spoken words without adding any extra commentary, punctuation corrections, or formatting.",
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();
    
    log(`Transcription successful: "${text}"`, 'info');
    return text;
    
  } catch (error) {
    log(`Transcription error: ${error.message}`, 'error');
    log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
    
    // Check for specific Gemini API errors
    if (error.message && error.message.includes('400')) {
      throw new Error(`Gemini API Error: Invalid request. Audio format may not be supported. MimeType: ${mimeType}`);
    } else if (error.message && error.message.includes('401')) {
      throw new Error('Gemini API Error: Invalid API key. Please check your settings.');
    } else if (error.message && error.message.includes('403')) {
      throw new Error('Gemini API Error: Access denied. Please check your API key permissions.');
    } else if (error.message && error.message.includes('429')) {
      throw new Error('Gemini API Error: Rate limit exceeded. Please try again later.');
    } else if (error.message && error.message.includes('500')) {
      throw new Error('Gemini API Error: Internal server error. Please try again.');
    } else {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
}
