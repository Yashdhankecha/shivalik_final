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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Plus, MessageCircle, ShoppingBag, Upload, X, Send, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';

interface Listing {
  _id: string;
  type: 'buy' | 'sell';
  title: string;
  description: string;
  price: number;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  status: string;
  communityId?: string;
}

interface Chat {
  _id: string;
  listingId: string;
  participants: Array<{ _id: string; name: string }>;
  messages: Array<{
    senderId: { _id: string; name: string };
    text: string;
    timestamp: string;
  }>;
}

const MarketplaceTab = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [showDialog, setShowDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    attachment: null as File | null
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (communityId) {
      fetchListings();
    }
  }, [communityId, page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Fetch only 'sell' type listings for this community
      const response = await communityApi.getListingsByCommunity(communityId!, {
        page,
        limit: 12,
        type: 'sell', // Only fetch sell listings
        status: 'approved'
      });
      // Filter to ensure only current community listings
      const listingsData = (response.result?.listings || []).filter(
        (listing: Listing) => listing.communityId === communityId || !listing.communityId
      );
      setListings(listingsData);
      setTotalPages(response.result?.pagination?.totalPages || 1);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('communityId', communityId!);
      formDataToSend.append('type', 'sell'); // Always set as 'sell' since we removed the type field
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      const response = await communityApi.createListing(formDataToSend);
      const listingStatus = response.result?.status || response.data?.status || 'pending';
      const message = response.message || response.result?.message || '';
      
      if (listingStatus === 'approved') {
        showMessage('Product listing created and posted successfully!', 'success');
      } else {
        showMessage('Product listing submitted successfully! It will be visible after admin approval.', 'success');
      }
      setShowDialog(false);
      setFormData({ 
        title: '', 
        description: '', 
        price: '', 
        attachment: null 
      });
      setPreview(null);
      fetchListings();
    } catch (error: any) {
      showMessage(error.message || 'Failed to create listing', 'error');
    }
  };

  const handleStartChat = async (listing: Listing) => {
    try {
      const response = await communityApi.startChat(listing._id);
      setChat(response.result);
      setSelectedListing(listing);
      setShowChatDialog(true);
      fetchChatMessages(listing._id);
    } catch (error: any) {
      showMessage(error.message || 'Failed to start chat', 'error');
    }
  };

  const fetchChatMessages = async (listingId: string) => {
    try {
      const response = await communityApi.getChatMessages(listingId);
      setChat(response.result);
    } catch (error: any) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedListing) return;

    try {
      await communityApi.sendMessage(selectedListing._id, messageText);
      setMessageText('');
      fetchChatMessages(selectedListing._id);
    } catch (error: any) {
      showMessage(error.message || 'Failed to send message', 'error');
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

  // Buy properties shows listings from sell section (same community)
  // Seller tab shows listings created by current user
  const buyListings = listings.filter(l => 
    l.type === 'sell' && 
    (l.communityId === communityId || !l.communityId)
  );
  const sellerListings = user 
    ? listings.filter(l => l.userId._id === user.id && l.type === 'sell')
    : [];

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Marketplace</h2>
        {user && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Product Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Product Listing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Product Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product in detail..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
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
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
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
                  <Button onClick={handleCreateListing} className="bg-black hover:bg-gray-800">
                    Post Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buyer' | 'seller')}>
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="buyer" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-md transition-all">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Buy ({buyListings.length})
          </TabsTrigger>
          <TabsTrigger value="seller" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-md transition-all">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sell ({sellerListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyer" className="mt-6">
          {buyListings.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
              <p className="text-gray-600">No products are currently listed in this community</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {buyListings.map((listing) => (
                <Card key={listing._id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden group bg-white">
                  {listing.attachment && (
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img src={getImageUrl(listing.attachment)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <Badge className="absolute top-3 right-3 bg-gray-900 text-white border-0 shadow-lg">For Sale</Badge>
                    </div>
                  )}
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1 min-h-[3rem]">{listing.title}</h3>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">₹{listing.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2 min-h-[2.5rem]">{listing.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-gray-200">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">{listing.userId.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 font-medium">{listing.userId.name}</span>
                      </div>
                      {user && listing.userId._id !== user.id && (
                        <Button
                          size="sm"
                          onClick={() => handleStartChat(listing)}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" />
                          Chat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seller" className="mt-6">
          {sellerListings.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
              <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Listed</h3>
              <p className="text-gray-600 mb-4">Create your first product listing to start selling</p>
              {user && (
                <Button onClick={() => setShowDialog(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product Listing
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sellerListings.map((listing) => (
                <Card key={listing._id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden group bg-white">
                  {listing.attachment && (
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img src={getImageUrl(listing.attachment)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <Badge className="absolute top-3 right-3 bg-gray-900 text-white border-0 shadow-lg">For Sale</Badge>
                    </div>
                  )}
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1 min-h-[3rem]">{listing.title}</h3>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">₹{listing.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2 min-h-[2.5rem]">{listing.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-gray-200">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">{listing.userId.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 font-medium">{listing.userId.name}</span>
                      </div>
                      {user && listing.userId._id !== user.id && (
                        <Button
                          size="sm"
                          onClick={() => handleStartChat(listing)}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" />
                          Chat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{selectedListing?.title}</p>
                <p className="text-sm text-gray-600 font-normal">Chat with seller</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {chat && (
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-6 bg-gray-50 min-h-[400px]">
              {chat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
                </div>
              ) : (
                chat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderId._id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {msg.senderId._id !== user?.id && (
                        <Avatar className="w-8 h-8 flex-shrink-0 border border-gray-200">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {msg.senderId.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          msg.senderId._id === user?.id
                            ? 'bg-gray-900 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {msg.senderId._id !== user?.id && (
                          <p className="text-xs font-semibold mb-1.5 opacity-90">{msg.senderId.name}</p>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-1.5 ${msg.senderId._id === user?.id ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.senderId._id === user?.id && (
                        <Avatar className="w-8 h-8 flex-shrink-0 border border-gray-200">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {msg.senderId.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-3">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!messageText.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

export default MarketplaceTab;
