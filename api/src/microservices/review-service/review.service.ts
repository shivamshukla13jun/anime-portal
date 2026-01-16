import ReviewLog, { IReviewLog, ReviewAction } from './review.model';
import { ApproveVideoInput, RejectVideoInput } from './review.validation';
import mongoose from 'mongoose';

export class ReviewService {
  async getReviewQueue(
    status: string = 'DRAFT_READY',
    page: number = 1,
    limit: number = 20
  ): Promise<{ videos: any[]; total: number; page: number; totalPages: number }> {
    const Video = mongoose.model('Video');
    const VideoProject = mongoose.model('VideoProject');
    
    // Get videos by status
    const query: any = { status };
    const skip = (page - 1) * limit;
    
    const videos = await Video.find(query)
      .populate('episodeId', 'title episodeNumber type')
      .populate('scriptId', 'content style duration')
      .populate('voiceId', 'audioUrl durationSeconds provider')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get project details for each video
    const videosWithProjects = await Promise.all(
      videos.map(async (video: any) => {
        const project = await VideoProject.findOne({ videoId: video._id })
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email');
        
        return {
          ...video.toObject(),
          project,
        };
      })
    );
    
    const total = await Video.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    return { 
      videos: videosWithProjects, 
      total, 
      page, 
      totalPages 
    };
  }

  async startReview(videoId: string, reviewerId: string): Promise<any> {
    const Video = mongoose.model('Video');
    
    const video = await Video.findByIdAndUpdate(
      videoId,
      { status: 'IN_REVIEW' },
      { new: true, runValidators: true }
    ).populate('episodeId', 'title episodeNumber type')
     .populate('scriptId', 'content style duration')
     .populate('voiceId', 'audioUrl durationSeconds provider');
    
    if (!video) {
      throw new Error('Video not found');
    }
    
    return video;
  }

  async approveVideo(
    videoId: string, 
    reviewerId: string, 
    data: ApproveVideoInput
  ): Promise<any> {
    const Video = mongoose.model('Video');
    const VideoProject = mongoose.model('VideoProject');
    
    // Create review log
    const reviewLog = new ReviewLog({
      videoId: new mongoose.Types.ObjectId(videoId),
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      action: 'APPROVED',
      note: data.note,
    });
    
    await reviewLog.save();
    
    // Update video status
    const newStatus = data.publishNow ? 'PUBLISHED' : 'FINAL_APPROVED';
    const video = await Video.findByIdAndUpdate(
      videoId,
      { status: newStatus },
      { new: true, runValidators: true }
    ).populate('episodeId', 'title episodeNumber type')
     .populate('scriptId', 'content style duration')
     .populate('voiceId', 'audioUrl durationSeconds provider');
    
    // Update project status if published
    if (data.publishNow) {
      await VideoProject.findOneAndUpdate(
        { videoId: new mongoose.Types.ObjectId(videoId) },
        { status: 'PUBLISHED' },
        { new: true, runValidators: true }
      );
    }
    
    // Auto-upload to YouTube if requested (placeholder)
    if (data.autoUploadYoutube && data.publishNow) {
      // In a real implementation, you would trigger YouTube upload here
      console.log(`YouTube upload triggered for video ${videoId}`);
    }
    
    return video;
  }

  async rejectVideo(
    videoId: string, 
    reviewerId: string, 
    data: RejectVideoInput
  ): Promise<any> {
    const Video = mongoose.model('Video');
    const VideoProject = mongoose.model('VideoProject');
    
    // Create review log
    const reviewLog = new ReviewLog({
      videoId: new mongoose.Types.ObjectId(videoId),
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      action: 'REJECTED',
      note: data.note,
    });
    
    await reviewLog.save();
    
    // Update video status back to DRAFT_READY for editing
    const video = await Video.findByIdAndUpdate(
      videoId,
      { status: 'DRAFT_READY' },
      { new: true, runValidators: true }
    ).populate('episodeId', 'title episodeNumber type')
     .populate('scriptId', 'content style duration')
     .populate('voiceId', 'audioUrl durationSeconds provider');
    
    // Update project status back to DRAFT_READY
    await VideoProject.findOneAndUpdate(
      { videoId: new mongoose.Types.ObjectId(videoId) },
      { status: 'DRAFT_READY' },
      { new: true, runValidators: true }
    );
    
    return video;
  }

  async getReviewHistory(videoId: string): Promise<IReviewLog[]> {
    return await ReviewLog.find({ videoId: new mongoose.Types.ObjectId(videoId) })
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getMyReviews(reviewerId: string): Promise<IReviewLog[]> {
    return await ReviewLog.find({ reviewerId: new mongoose.Types.ObjectId(reviewerId) })
      .populate('videoId', 'episodeId type status')
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 });
  }
}
