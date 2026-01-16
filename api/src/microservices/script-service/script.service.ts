import Script, { IScript, ScriptDuration, ScriptStyle } from './script.model';
import { GenerateScriptInput, UpdateScriptInput } from './script.validation';
import mongoose from 'mongoose';

export class ScriptService {
  async generateScript(data: GenerateScriptInput): Promise<IScript> {
    // Check if script already exists for this episode
    const existingScript = await Script.findOne({ 
      episodeId: new mongoose.Types.ObjectId(data.episodeId) 
    });
    
    if (existingScript) {
      throw new Error('Script already exists for this episode');
    }

    // Generate script content based on template
    const content = await this.generateScriptContent(data.episodeId, data.duration, data.style);

    const script = new Script({
      episodeId: new mongoose.Types.ObjectId(data.episodeId),
      duration: data.duration,
      style: data.style,
      content,
      status: 'DRAFT',
    });

    return await script.save();
  }

  async getScriptById(id: string): Promise<IScript | null> {
    return await Script.findById(id).populate('episodeId', 'title episodeNumber');
  }

  async getScriptByEpisodeId(episodeId: string): Promise<IScript | null> {
    return await Script.findOne({ episodeId: new mongoose.Types.ObjectId(episodeId) })
      .populate('episodeId', 'title episodeNumber');
  }

  async updateScript(id: string, data: UpdateScriptInput): Promise<IScript | null> {
    return await Script.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('episodeId', 'title episodeNumber');
  }

  async approveScript(id: string): Promise<IScript | null> {
    return await Script.findByIdAndUpdate(
      id, 
      { status: 'APPROVED' }, 
      { new: true, runValidators: true }
    ).populate('episodeId', 'title episodeNumber');
  }

  async deleteScript(id: string): Promise<boolean> {
    const result = await Script.findByIdAndDelete(id);
    return !!result;
  }

  async getAllScripts(status?: string): Promise<IScript[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    return await Script.find(query)
      .populate('episodeId', 'title episodeNumber')
      .sort({ createdAt: -1 });
  }

  private async generateScriptContent(
    episodeId: string, 
    duration: ScriptDuration, 
    style: ScriptStyle
  ): Promise<string> {
    // This is a template-based script generator
    // In the future, this can be extended to use OpenAI or other AI services
    
    const templates = {
      explained: {
        short: `Welcome to today's episode! Let me explain what makes this content special.

[Opening hook - 15 seconds]
Today we're diving into something incredible that you won't want to miss.

[Main explanation - 45 seconds]
The key points to understand are:
1. First major point about the content
2. Second important detail
3. Third fascinating aspect

[Conclusion - 10 seconds]
Thanks for watching! Don't forget to like and subscribe for more content like this.`,

        long: `Welcome to our in-depth exploration! Today we're taking a comprehensive look at this amazing content.

[Introduction - 30 seconds]
In this detailed breakdown, we'll explore every aspect that makes this content stand out from the rest.

[Deep Dive Part 1 - 2 minutes]
Let's start with the foundation. The origins and background are crucial to understanding...

[Deep Dive Part 2 - 2 minutes]
Now let's examine the key elements that define this experience...

[Analysis and Insights - 90 seconds]
What makes this truly special is the way it combines different elements...

[Conclusion - 30 seconds]
Thank you for joining us on this journey. We hope you've gained valuable insights!`
      },
      top: {
        short: `Top 3 things you need to know right now!

[Number 3 - 15 seconds]
Coming in at number three...

[Number 2 - 15 seconds]
The second most important thing...

[Number 1 - 20 seconds]
And the number one thing you absolutely must know...

[Outro - 10 seconds]
Thanks for watching! Hit that subscribe button!`,

        long: `Top 10 essential facts about this incredible content!

[Introduction - 20 seconds]
Get ready to discover the most important aspects you need to know!

[Numbers 10-4 - 2 minutes]
Starting with number ten... [detailed explanations]

[Numbers 3-1 - 90 seconds]
Now for the top three most important facts...

[Bonus content - 30 seconds]
And as a special bonus, here's one extra thing...

[Conclusion - 20 seconds]
That's our complete list! Which one surprised you the most? Let us know!`
      },
      review: {
        short: `My honest review of this content!

[First impressions - 20 seconds]
Right from the start, here's what I thought...

[The good stuff - 25 seconds]
What really works well here is...

[Room for improvement - 15 seconds]
However, there are a few areas that could be better...

[Final verdict - 10 seconds]
My final rating and recommendation...`,

        long: `A comprehensive review of this content from every angle.

[Overview - 45 seconds]
Let me give you my complete assessment of what we're looking at today.

[Strengths - 2 minutes]
The standout features that make this exceptional are...

[Weaknesses - 90 seconds]
However, we need to be honest about the areas that fall short...

[Comparison - 60 seconds]
How does this stack up against similar content in the genre?

[Final verdict - 45 seconds]
After careful consideration, here's my final evaluation and recommendation...`
      }
    };

    const template = templates[style]?.[duration] || templates.explained.short;
    
    // In a real implementation, you would fetch episode details and customize the template
    // For now, we'll return the template as-is
    return template;
  }
}
