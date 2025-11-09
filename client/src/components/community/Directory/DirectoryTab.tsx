import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communityApi } from '../../../apis/community';
import { showMessage } from '../../../utils/Constant';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Search, Wrench, Lightbulb, Shield, Sparkles, Hammer, Paintbrush, Flower2, Settings, Phone, Mail, Clock, MapPin, CheckCircle, Star, Users, User, Crown } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';

interface DirectoryEntry {
  _id: string;
  name: string;
  serviceType: string;
  contactNumber: string;
  alternateContact?: string;
  email?: string;
  availabilityHours: string;
  address?: string;
  verified: boolean;
  rating?: number;
}

interface CommunityMember {
  _id: string;
  name: string;
  email?: string;
  role: string;
  isManager: boolean;
}

const serviceIcons: Record<string, any> = {
  plumber: Wrench,
  electrician: Lightbulb,
  security: Shield,
  housekeeping: Sparkles,
  carpenter: Hammer,
  painter: Paintbrush,
  gardener: Flower2,
  mechanic: Settings,
  other: Settings
};

const serviceColors: Record<string, string> = {
  plumber: 'bg-gray-100 text-gray-700 border-gray-200',
  electrician: 'bg-gray-100 text-gray-700 border-gray-200',
  security: 'bg-gray-100 text-gray-700 border-gray-200',
  housekeeping: 'bg-gray-100 text-gray-700 border-gray-200',
  carpenter: 'bg-gray-100 text-gray-700 border-gray-200',
  painter: 'bg-gray-100 text-gray-700 border-gray-200',
  gardener: 'bg-gray-100 text-gray-700 border-gray-200',
  mechanic: 'bg-gray-100 text-gray-700 border-gray-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200'
};

const DirectoryTab = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'directory' | 'members'>('directory');

  useEffect(() => {
    if (communityId) {
      fetchEntries();
      fetchCommunityMembers();
    }
  }, [communityId, searchQuery, serviceFilter]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (serviceFilter !== 'all') params.serviceType = serviceFilter;
      
      const response = await communityApi.getDirectoryEntries(communityId!, params);
      // Handle different response structures
      const entriesData = response.result || response.data || response || [];
      // Ensure it's always an array
      setEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load directory entries', 'error');
      setEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await communityApi.getCommunityMembers(communityId!);
      // Handle different response structures
      const membersData = response.result || response.data || response || [];
      // Ensure it's always an array
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load community members', 'error');
      setMembers([]); // Set empty array on error
    } finally {
      setMembersLoading(false);
    }
  };


  const getServiceIcon = (serviceType: string) => {
    const Icon = serviceIcons[serviceType] || serviceIcons.other;
    return <Icon className="w-5 h-5" />;
  };

  const filteredEntries = entries.filter(entry => {
    if (serviceFilter !== 'all' && entry.serviceType !== serviceFilter) return false;
    if (searchQuery && !entry.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Directory</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Find trusted service providers and community members</p>
        </div>
      </div>

      {/* Tabs for Directory and Members */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'directory'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Service Providers
            </span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community Members
            </span>
          </button>
        </nav>
      </div>

      {activeTab === 'directory' ? (
        <>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="plumber">Plumber</SelectItem>
                <SelectItem value="electrician">Electrician</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                <SelectItem value="carpenter">Carpenter</SelectItem>
                <SelectItem value="painter">Painter</SelectItem>
                <SelectItem value="gardener">Gardener</SelectItem>
                <SelectItem value="mechanic">Mechanic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEntries.length === 0 ? (
            <Card className="p-12 text-center bg-gray-50 border-2 border-gray-200">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">No Directory Entries</h3>
              <p className="text-gray-600">No service providers found in this community</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry) => {
                const Icon = serviceIcons[entry.serviceType] || serviceIcons.other;
                const colorClass = serviceColors[entry.serviceType] || serviceColors.other;
                
                return (
                  <Card key={entry._id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${colorClass}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {entry.verified && (
                          <Badge className="bg-black text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-black mb-2">{entry.name}</h3>
                      <Badge variant="outline" className={`mb-3 ${colorClass}`}>
                        {entry.serviceType.charAt(0).toUpperCase() + entry.serviceType.slice(1)}
                      </Badge>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${entry.contactNumber}`} className="text-blue-600 hover:underline">
                            {entry.contactNumber}
                          </a>
                        </div>
                        {entry.alternateContact && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{entry.alternateContact}</span>
                          </div>
                        )}
                        {entry.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline">
                              {entry.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{entry.availabilityHours}</span>
                        </div>
                        {entry.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{entry.address}</span>
                          </div>
                        )}
                      </div>
                      
                      {entry.rating && (
                        <div className="flex items-center gap-1 pt-3 border-t">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{entry.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Community Members Tab */
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search members by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {membersLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : members.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Community Members</h3>
              <p className="text-gray-600">No members found in this community</p>
            </Card>
          ) : (
            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Member</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden sm:table-cell">Role</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                        <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                      {members
                        .filter(member => 
                          searchQuery === '' || 
                          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((member) => (
                          <TableRow key={member._id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center border border-gray-200">
                                    <span className="text-white font-semibold text-sm">
                                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  {member.isManager && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                                      <Crown className="w-3 h-3 text-yellow-800" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{member.name}</p>
                                  <div className="sm:hidden mt-1">
                                    <Badge 
                                      className={
                                        member.isManager 
                                          ? "bg-yellow-100 text-yellow-800 text-xs" 
                                          : "bg-gray-100 text-gray-800 text-xs"
                                      }
                                    >
                                      {member.role}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                              <Badge 
                                className={
                                  member.isManager 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                              {member.email ? (
                                <span className="truncate block max-w-xs">{member.email}</span>
                              ) : (
                                <span className="text-gray-400">No email</span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 sm:px-6 py-4">
                              {member.email ? (
                                <a 
                                  href={`mailto:${member.email}`} 
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                >
                                  Email
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No contact</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DirectoryTab;