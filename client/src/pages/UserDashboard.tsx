import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import { Community as CommunityType } from '../types/CommunityTypes';
import { showMessage } from '../utils/Constant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Search, Users, Star,
  ChevronRight, MapPin, Settings, LogOut, Building2,
  UserPlus, Check, Clock, Calendar
} from 'lucide-react';

interface JoinRequest {
  communityId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedAt?: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic data from API
  const [allCommunities, setAllCommunities] = useState<CommunityType[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityType[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (isAuthenticated && allCommunities.length > 0) {
      fetchJoinRequests();
    }
  }, [isAuthenticated, allCommunities]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // Fetch all communities - get first page with high limit
      let allCommunitiesData: CommunityType[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await communityApi.getAllCommunities({ 
          page, 
          limit: 100 // High limit to get all in one go if possible
        });
        
        // Handle the response structure from the backend API
        let communities: CommunityType[] = [];
        let pagination: any = null;
        
        if (response && response.result) {
          communities = response.result.communities || [];
          pagination = response.result.pagination;
        } else if (response && response.data) {
          communities = response.data.communities || response.data || [];
          pagination = response.data.pagination;
        } else if (Array.isArray(response)) {
          communities = response;
        }
        
        allCommunitiesData = [...allCommunitiesData, ...communities];
        
        // Check if there are more pages
        if (pagination) {
          hasMore = page < pagination.totalPages;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Fetched ${allCommunitiesData.length} communities`);
      setAllCommunities(allCommunitiesData);
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      showMessage(error.message || 'Failed to load communities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await communityApi.getUserJoinRequests();
      // Handle response structure
      const requestsData = response.result || response.data || response;
      const requests = Array.isArray(requestsData) ? requestsData : (requestsData.requests || []);
      
      setJoinRequests(requests.map((req: any) => ({
        communityId: req.communityId?._id || req.communityId,
        status: req.status.toLowerCase()
      })));
      
      // Get approved communities (user's joined communities)
      const approvedRequests = requests.filter((req: any) => 
        req.status === 'Approved' || req.status === 'approved'
      );
      
      // Get community details for approved requests
      const joinedCommunityIds = approvedRequests.map((req: any) => 
        req.communityId?._id || req.communityId
      );
      
      // Filter communities that user has joined
      const joinedCommunities = allCommunities.filter((c: CommunityType) =>
        joinedCommunityIds.includes(c._id)
      );
      
      setMyCommunities(joinedCommunities);
    } catch (error) {
      // User might not be authenticated, that's okay
      console.log('Could not fetch join requests:', error);
      setMyCommunities([]);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/community/${communityId}` } });
      return;
    }
    
    try {
      await communityApi.createJoinRequest({ communityId });
      showMessage('Join request sent successfully!', 'success');
      // Refresh join requests to get updated status
      if (allCommunities.length > 0) {
        await fetchJoinRequests();
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to send join request', 'error');
    }
  };

  const getJoinRequestStatus = (communityId: string) => {
    const request = joinRequests.find(r => r.communityId === communityId);
    return request?.status;
  };

  const getCommunityColor = (index: number) => {
    const colors = [
      'from-gray-700 to-gray-900',
      'from-gray-600 to-gray-800',
      'from-gray-500 to-gray-700',
      'from-gray-400 to-gray-600',
      'from-gray-300 to-gray-500',
      'from-gray-200 to-gray-400',
      'from-gray-100 to-gray-300',
      'from-gray-50 to-gray-200'
    ];
    return colors[index % colors.length];
  };

  const filteredCommunities = allCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar - Responsive */}
      <nav className="bg-white backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-gray-300">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                Real Estate Community
              </span>
            </div>

            {/* Right Actions - Profile Only for authenticated users, Guest option for others */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100 rounded-full px-2 py-1 sm:px-4 sm:py-2 transition-colors border border-gray-300"
                    >
                      <Avatar className="w-7 h-7 sm:w-9 sm:h-9 border-2 border-gray-300">
                        <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white font-semibold text-xs sm:text-sm">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-black font-medium text-sm">{user?.name || 'User'}</span>
                      <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-1 w-48 sm:w-56 bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 py-2">
                        <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200">
                          <p className="font-semibold text-black text-sm sm:text-base">{user?.name || 'User'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{user?.email}</p>
                        </div>
                        <button className="w-full px-3 py-2 sm:px-4 sm:py-2 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3 text-black text-sm sm:text-base" onClick={() => navigate('/profile')}>
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span>Profile</span>
                        </button>
                        <button className="w-full px-3 py-2 sm:px-4 sm:py-2 text-left hover:bg-gray-100 flex items-center gap-2 sm:gap-3 text-black text-sm sm:text-base" onClick={() => navigate('/settings')}>
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 text-left hover:bg-red-50 text-red-500 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline text-gray-600 text-xs sm:text-sm">Guest Access</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row max-w-full">
        {/* LEFT SIDEBAR - My Communities Navigation - Responsive */}
        <aside className="w-full md:w-64 lg:w-72 bg-white backdrop-blur-sm border-r border-gray-200 h-auto md:h-[calc(100vh-3.5rem)] md:sticky top-14 md:top-16 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {/* Search Communities */}
            <div className="mb-3 sm:mb-4">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 sm:pl-10 h-8 sm:h-10 bg-white border-gray-300 text-black placeholder:text-gray-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Your Communities */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">My Communities</h3>
              </div>
              
              {loading ? (
                <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">Loading...</div>
              ) : myCommunities.length > 0 ? (
                <div className="space-y-2">
                  {myCommunities.map((community, index) => (
                    <div
                      key={community._id}
                      onClick={() => navigate(`/community/${community._id}`)}
                      className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${getCommunityColor(index)} flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform text-sm sm:text-base flex-shrink-0`}>
                          {community.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-black text-sm sm:text-base mb-1 truncate group-hover:text-gray-700 transition-colors">
                            {community.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{community.totalUnits || community.members?.length || 0} {community.totalUnits ? 'units' : 'members'}</span>
                            </div>
                            {community.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate">{community.location.city || ''}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                              Click to explore →
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">No communities joined yet</p>
                  <p className="text-xs text-gray-400">Join a community to get started</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN SECTION - Browse All Communities */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2">Browse Communities</h1>
            <p className="text-gray-600 text-sm sm:text-base">Discover and join communities that match your interests</p>
            {!isAuthenticated && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-medium">Guest Mode:</span> You can browse communities, but you'll need to sign in to join them.
                </p>
              </div>
            )}
          </div>

          {/* Community Grid - Responsive */}
          {loading ? (
            <div className="flex justify-center items-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-gray-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredCommunities.map((community, index) => (
                <Card 
                  key={community._id} 
                  className="bg-white backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => navigate(`/community/${community._id}`)}
                >
                  <div className={`h-32 sm:h-48 rounded-t-lg sm:rounded-t-xl bg-gradient-to-br ${getCommunityColor(index)} relative overflow-hidden`}>
                    {community.bannerImage ? (
                      <img
                        src={community.bannerImage}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 sm:w-16 sm:h-16 text-white/30" />
                      </div>
                    )}
                    {community.isFeatured && (
                      <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
                        <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                  </div>
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="font-bold text-base sm:text-lg text-black group-hover:text-gray-800 transition-colors">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{community.totalUnits || 0}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {community.shortDescription || community.description?.substring(0, 80) + '...'}
                    </p>
                    
                    {/* Uniform second card layout - Location and Status info */}
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              {community.location?.city || 'Location N/A'}
                            </p>
                            {community.location?.state && (
                              <p className="text-xs text-gray-500">{community.location.state}</p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={community.status === 'Active' || community.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs bg-gray-200 text-gray-700"
                        >
                          {community.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        {community.establishedYear && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Est. {community.establishedYear}</span>
                          </div>
                        )}
                      </div>
                      
                      {isAuthenticated ? (
                        getJoinRequestStatus(community._id) === 'approved' ? (
                          <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Joined
                          </Button>
                        ) : getJoinRequestStatus(community._id) === 'pending' ? (
                          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3" disabled>
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Pending
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-black hover:bg-gray-800 text-white h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinCommunity(community._id);
                            }}
                          >
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Join
                          </Button>
                        )
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-black hover:bg-gray-800 text-white h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/login', { state: { from: `/community/${community._id}` } });
                          }}
                        >
                          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Sign In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCommunities.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-1 sm:mb-2">No communities found</h3>
              <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or browse all communities</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;