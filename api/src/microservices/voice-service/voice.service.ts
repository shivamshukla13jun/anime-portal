import Voice, { IVoice, VoiceProvider } from './voice.model';
import { GenerateVoiceInput } from './voice.validation';
import mongoose from 'mongoose';
import path from 'path';

// Provider adapter interface
export interface VoiceProviderAdapter {
  generateVoice(text: string): Promise<{ audioUrl: string; durationSeconds: number }>;
}

// Google TTS Adapter (placeholder)
class GoogleTTSAdapter implements VoiceProviderAdapter {
  async generateVoice(text: string): Promise<{ audioUrl: string; durationSeconds: number }> {
    // Placeholder implementation - returns dummy audio
    const duration = Math.ceil(text.length / 10); // Rough estimate: 10 chars per second
    const audioUrl = `/uploads/voices/google-${Date.now()}.mp3`;
    
    // In a real implementation, you would:
    // 1. Call Google Text-to-Speech API
    // 2. Save the audio file to uploads/voices/
    // 3. Return the actual file path
    
    return { audioUrl, durationSeconds: duration };
  }
}

// ElevenLabs Adapter (placeholder)
class ElevenLabsAdapter implements VoiceProviderAdapter {
  async generateVoice(text: string): Promise<{ audioUrl: string; durationSeconds: number }> {
    // Placeholder implementation
    const duration = Math.ceil(text.length / 12); // Rough estimate
    const audioUrl = `/uploads/voices/elevenlabs-${Date.now()}.mp3`;
    
    // In a real implementation, you would:
    // 1. Call ElevenLabs API
    // 2. Save the audio file
    // 3. Return the actual file path
    
    return { audioUrl, durationSeconds: duration };
  }
}

// AWS Polly Adapter (placeholder)
class PollyAdapter implements VoiceProviderAdapter {
  async generateVoice(text: string): Promise<{ audioUrl: string; durationSeconds: number }> {
    // Placeholder implementation
    const duration = Math.ceil(text.length / 11); // Rough estimate
    const audioUrl = `/uploads/voices/polly-${Date.now()}.mp3`;
    
    // In a real implementation, you would:
    // 1. Call AWS Polly API
    // 2. Save the audio file
    // 3. Return the actual file path
    
    return { audioUrl, durationSeconds: duration };
  }
}

export class VoiceService {
  private getProvider(provider: VoiceProvider): VoiceProviderAdapter {
    switch (provider) {
      case 'google':
        return new GoogleTTSAdapter();
      case 'elevenlabs':
        return new ElevenLabsAdapter();
      case 'polly':
        return new PollyAdapter();
      default:
        throw new Error(`Unsupported voice provider: ${provider}`);
    }
  }

  async generateVoice(data: GenerateVoiceInput): Promise<IVoice> {
    // Check if voice already exists for this script
    const existingVoice = await Voice.findOne({ 
      scriptId: new mongoose.Types.ObjectId(data.scriptId) 
    });
    
    if (existingVoice) {
      throw new Error('Voice already exists for this script');
    }

    // Get script content
    const Script = mongoose.model('Script');
    const script = await Script.findById(data.scriptId);
    
    if (!script) {
      throw new Error('Script not found');
    }

    // Generate voice using the specified provider
    const provider = this.getProvider(data.provider);
    const { audioUrl, durationSeconds } = await provider.generateVoice(script.get('content'));

    const voice = new Voice({
      scriptId: new mongoose.Types.ObjectId(data.scriptId),
      provider: data.provider,
      audioUrl,
      durationSeconds,
    });

    return await voice.save();
  }

  async getVoiceById(id: string): Promise<IVoice | null> {
    return await Voice.findById(id).populate('scriptId', 'content style duration');
  }

  async getVoiceByScriptId(scriptId: string): Promise<IVoice | null> {
    return await Voice.findOne({ scriptId: new mongoose.Types.ObjectId(scriptId) })
      .populate('scriptId', 'content style duration');
  }

  async deleteVoice(id: string): Promise<boolean> {
    const result = await Voice.findByIdAndDelete(id);
    return !!result;
  }

  async getAllVoices(): Promise<IVoice[]> {
    return await Voice.find()
      .populate('scriptId', 'content style duration')
      .sort({ createdAt: -1 });
  }
}
