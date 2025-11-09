import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communityApi } from '../../../apis/community';
import { showMessage } from '../../../utils/Constant';
import { getImageUrl } from '../../../utils/imageUtils';
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
import { Plus, Heart, Share2, Upload, X, TrendingUp, Clock, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Community Pulses</h2>
      </div>

      {pulses.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
          <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pulses Yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share what's happening in your community!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pulses.map((pulse) => (
            <Card key={pulse._id} className="hover:shadow-md transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="w-10 h-10 border border-gray-300 flex-shrink-0">
                    <AvatarFallback className="bg-gray-800 text-white">
                      {pulse.userId.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{pulse.userId.name}</h3>
                      <span className="text-xs text-gray-500">
                        {formatDateToDDMMYYYY(pulse.createdAt)}
                      </span>
                      {pulse.status !== 'approved' && (
                        <Badge variant="secondary" className="text-xs">
                          {pulse.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{pulse.title}</h4>
                    <p className="text-gray-700 mb-4">{pulse.description}</p>
                    
                    {pulse.attachment && (
                      <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={getImageUrl(pulse.attachment)} 
                          alt={pulse.title} 
                          className="w-full h-auto max-h-96 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{pulse.likes?.length || 0} likes</span>
                      </div>
                      
                      <button
                        onClick={() => handleShare(pulse)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {copiedPulseId === pulse._id ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 sm:px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PulsesTab;