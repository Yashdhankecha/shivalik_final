import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communityApi } from '../../../apis/community';
import { showMessage } from '../../../utils/Constant';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Plus, Heart, MessageCircle, Share2, Upload, X, TrendingUp, Clock, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface Pulse {
  _id: string;
  title: string;
  description: string;
  territory: string;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  likes: string[];
  comments: Array<{
    userId: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  status: string;
}

const PulsesTab = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedPulses, setLikedPulses] = useState<Set<string>>(new Set());
  const [copiedPulseId, setCopiedPulseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    territory: 'general',
    attachment: null as File | null
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (communityId) {
      fetchPulses();
    }
  }, [communityId, page]);

  useEffect(() => {
    // Initialize liked pulses
    if (user && pulses.length > 0) {
      const liked = new Set<string>();
      pulses.forEach(pulse => {
        if (pulse.likes.includes(user.id)) {
          liked.add(pulse._id);
        }
      });
      setLikedPulses(liked);
    }
  }, [pulses, user]);

  const fetchPulses = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getPulsesByCommunity(communityId!, {
        page,
        limit: 10
      });
      const pulsesData = response.result?.pulses || response.data?.pulses || [];
      setPulses(Array.isArray(pulsesData) ? pulsesData : []);
      setTotalPages(response.result?.pagination?.totalPages || response.data?.pagination?.totalPages || 1);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load pulses', 'error');
      setPulses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePulse = async () => {
    if (!formData.title || !formData.description) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('communityId', communityId!);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('territory', formData.territory);
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      const response = await communityApi.createPulse(formDataToSend);
      
      const pulseStatus = response.result?.status || response.data?.status || 'pending';
      
      if (pulseStatus === 'approved') {
        showMessage('Pulse created and posted successfully!', 'success');
      } else {
        showMessage('Pulse submitted successfully! It will be visible after admin approval.', 'success');
      }
      
      setShowDialog(false);
      setFormData({ title: '', description: '', territory: 'general', attachment: null });
      setPreview(null);
      fetchPulses();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create pulse';
      showMessage(errorMessage, 'error');
      console.error('Error creating pulse:', error);
    }
  };

  const handleLike = async (pulseId: string) => {
    if (!user) {
      showMessage('Please login to like pulses', 'error');
      return;
    }
    
    try {
      await communityApi.toggleLikePulse(pulseId);
      fetchPulses();
    } catch (error: any) {
      showMessage(error.message || 'Failed to like pulse', 'error');
    }
  };

  const handleShare = async (pulse: Pulse) => {
    const pulseUrl = `${window.location.origin}/community/${communityId}?pulse=${pulse._id}`;
    
    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: pulse.title,
          text: pulse.description,
          url: pulseUrl,
        });
        return;
      } catch (error: any) {
        // User cancelled or error occurred, fall back to copy
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
    
    // Fallback to copy to clipboard
    try {
      await navigator.clipboard.writeText(pulseUrl);
      setCopiedPulseId(pulse._id);
      showMessage('Link copied to clipboard!', 'success');
      setTimeout(() => setCopiedPulseId(null), 2000);
    } catch (error) {
      showMessage('Failed to copy link', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachment: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && pulses.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black">Community Pulses</h2>
          <p className="text-gray-600 mt-1">Stay updated with the latest community news and updates</p>
        </div>
        {user && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Pulse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Pulse</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Territory</label>
                  <Select value={formData.territory} onValueChange={(value) => setFormData({ ...formData, territory: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="block-a">Block A</SelectItem>
                      <SelectItem value="block-b">Block B</SelectItem>
                      <SelectItem value="block-c">Block C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter pulse title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's on your mind?"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Attachment (Image)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                        <button
                          onClick={() => {
                            setPreview(null);
                            setFormData({ ...formData, attachment: null });
                          }}
                          className="absolute top-2 right-2 bg-black text-white rounded-full p-1 hover:bg-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePulse} className="bg-black hover:bg-gray-800">
                    Post Pulse
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {pulses.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border-2 border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Pulses Yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share a pulse in this community</p>
          {user && (
            <Button onClick={() => setShowDialog(true)} className="bg-black hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Create First Pulse
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {pulses.map((pulse) => {
            const isLiked = likedPulses.has(pulse._id);
            const isCopied = copiedPulseId === pulse._id;
            
            return (
              <Card key={pulse._id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-gray-200">
                        <AvatarFallback className="bg-black text-white font-bold">
                          {pulse.userId.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-black">{pulse.userId.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(pulse.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      {pulse.territory}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-3">{pulse.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{pulse.description}</p>
                  
                  {pulse.attachment && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-4 shadow-md">
                      <img src={pulse.attachment} alt="Pulse attachment" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 pt-4 border-t">
                    <button
                      onClick={() => handleLike(pulse._id)}
                      className={`flex items-center gap-2 transition-all ${
                        isLiked 
                          ? 'text-black hover:text-gray-700' 
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">{pulse.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{pulse.comments.length}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(pulse)}
                      className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5" />
                          <span className="font-medium">Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PulsesTab;
