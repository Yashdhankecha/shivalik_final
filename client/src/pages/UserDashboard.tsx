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
  UserPlus, Check, Clock, Calendar, X
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
  const [nonMemberCommunities, setNonMemberCommunities] = useState<CommunityType[]>([]);

  // Prevent admin users from accessing user dashboard
  useEffect(() => {
    if (user) {
      const authToken = localStorage.getItem('auth_token');
      const isAdminToken = authToken && authToken.startsWith('admin-token');
      const isAdminUser = user?.role === 'Admin' || user?.role === 'SuperAdmin' || isAdminToken;
      
      if (isAdminUser) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCommunities();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && allCommunities.length > 0) {
      fetchJoinRequests();
      // Update non-member communities when auth status changes
      const updateNonMemberCommunities = async () => {
        const nonMemberComms = [];
        for (const community of allCommunities) {
          try {
            const membershipResponse = await communityApi.checkCommunityMembership(community._id);
            const isMember = membershipResponse.result?.isMember || false;
            if (!isMember) {
              nonMemberComms.push(community);
            }
          } catch (error) {
            // If there's an error checking membership, include the community by default
            console.error(`Error checking membership for community ${community._id}:`, error);
            nonMemberComms.push(community);
          }
        }
        setNonMemberCommunities(nonMemberComms);
      };
      updateNonMemberCommunities();
    } else if (!isAuthenticated) {
      // For non-authenticated users, show all communities
      setNonMemberCommunities(allCommunities);
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
      
      // Filter out communities the user is already a member of
      if (isAuthenticated) {
        const nonMemberComms = [];
        for (const community of allCommunitiesData) {
          try {
            const membershipResponse = await communityApi.checkCommunityMembership(community._id);
            const isMember = membershipResponse.result?.isMember || false;
            if (!isMember) {
              nonMemberComms.push(community);
            }
          } catch (error) {
            // If there's an error checking membership, include the community by default
            console.error(`Error checking membership for community ${community._id}:`, error);
            nonMemberComms.push(community);
          }
        }
        setNonMemberCommunities(nonMemberComms);
      } else {
        // For non-authenticated users, show all communities
        setNonMemberCommunities(allCommunitiesData);
      }
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

  const filteredCommunities = nonMemberCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Responsive */}
      <nav className="bg-white backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm border border-gray-300">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                Real Estate Community
              </span>
            </div>

            {/* Right Actions - Profile Only for authenticated users, Guest option for others */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 rounded-full p-1 pr-2 sm:pr-3 transition-colors border border-gray-300"
                  >
                    <Avatar className="w-7 h-7 sm:w-9 sm:h-9 border border-gray-300">
                      <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs sm:text-sm">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome{isAuthenticated && user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-600">
            {isAuthenticated 
              ? "Explore communities and connect with fellow real estate professionals." 
              : "Join our community to connect with real estate professionals."}
          </p>
        </div>

        {/* My Communities Section */}
        {isAuthenticated && myCommunities.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Communities</h2>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/communities')}
                className="text-gray-600 hover:text-gray-900"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {myCommunities.slice(0, 3).map((community) => (
                <Card 
                  key={community._id} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded-xl cursor-pointer"
                  onClick={() => navigate(`/community/${community._id}`)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      {community.logo ? (
                        <img 
                          src={community.logo} 
                          alt={community.name} 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{community.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {community.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {(community.members?.length || 0)} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Communities Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Explore Communities</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Communities Found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'No communities match your search criteria' 
                  : 'There are currently no communities available'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCommunities.map((community, index) => {
                const joinStatus = getJoinRequestStatus(community._id);
                return (
                  <Card 
                    key={community._id} 
                    className="hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded-xl"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        {community.logo ? (
                          <img 
                            src={community.logo} 
                            alt={community.name} 
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${getCommunityColor(index)} rounded-lg flex items-center justify-center`}>
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{community.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                            {community.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {(community.members?.length || 0)} members
                            </span>
                          </div>
                          
                          {/* Join Status or Button */}
                          <div className="mt-3">
                            {joinStatus === 'approved' ? (
                              <Button 
                                size="sm" 
                                className="w-full bg-green-100 hover:bg-green-200 text-green-800"
                                onClick={() => navigate(`/community/${community._id}`)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Joined
                              </Button>
                            ) : joinStatus === 'pending' ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full border-yellow-300 text-yellow-800"
                                disabled
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Pending
                              </Button>
                            ) : joinStatus === 'rejected' ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full border-red-300 text-red-800"
                                disabled
                              >
                                <X className="w-4 h-4 mr-1" />
                                Rejected
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                className="w-full bg-black hover:bg-gray-800 text-white"
                                onClick={() => handleJoinCommunity(community._id)}
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Join Community
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;