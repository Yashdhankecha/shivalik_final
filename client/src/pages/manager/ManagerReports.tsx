import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  AlertTriangle, Search, Eye, RefreshCw, ChevronLeft, ChevronRight,
  Clock, CheckCircle, XCircle, AlertCircle, Filter
} from 'lucide-react';
import { managerApi } from '../../apis/manager';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

const ManagerReports = () => {
  const { communityId: urlCommunityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const [communityId, setCommunityId] = useState<string>('');
  const { toast } = useToast();

  // Fetch manager's communities and set communityId
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await managerApi.getManagerCommunities();
        const data = response?.data || response?.result || response;
        const communitiesList = data?.communities || [];

        if (urlCommunityId) {
          const community = communitiesList.find((c: any) => c._id === urlCommunityId);
          if (community) {
            setCommunityId(urlCommunityId);
          } else {
            toast({
              title: "Error",
              description: "Community not found or you don't have access",
              variant: "destructive"
            });
            navigate('/manager');
          }
        } else if (communitiesList.length > 0) {
          navigate(`/manager/${communitiesList[0]._id}/reports`, { replace: true });
        }
      } catch (error: any) {
        console.error('Error fetching communities:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch communities",
          variant: "destructive"
        });
      }
    };

    fetchCommunities();
  }, [urlCommunityId, navigate, toast]);

  useEffect(() => {
    if (communityId && communityId !== 'placeholder-community-id') {
      fetchReports();
    }
  }, [communityId, pagination.page, searchTerm, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getCommunityReports(communityId, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filters.status || undefined,
        type: filters.type || undefined
      });
      
      let reportsData = [];
      let paginationData = pagination;
      
      if (response?.data?.reports) {
        reportsData = response.data.reports;
        paginationData = response.data.pagination || pagination;
      } else if (response?.result?.reports) {
        reportsData = response.result.reports;
        paginationData = response.result.pagination || pagination;
      } else if (response?.reports) {
        reportsData = response.reports;
        paginationData = response.pagination || pagination;
      } else if (Array.isArray(response?.data)) {
        reportsData = response.data;
        paginationData = {
          ...pagination,
          total: reportsData.length,
          totalPages: Math.ceil(reportsData.length / pagination.limit)
        };
      } else if (Array.isArray(response)) {
        reportsData = response;
        paginationData = {
          ...pagination,
          total: reportsData.length,
          totalPages: Math.ceil(reportsData.length / pagination.limit)
        };
      }
      
      setReports(reportsData);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'spam': 'bg-red-100 text-red-800',
      'inappropriate': 'bg-orange-100 text-orange-800',
      'harassment': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type?.toLowerCase()] || colors['other']}>{type || 'Other'}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Community Reports</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage community reports</p>
        </div>
        <div className="mt-4 flex md:mt-0">
          <Button onClick={fetchReports} variant="outline" className="border-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-900 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-900 text-sm"
              >
                <option value="">All Types</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-700" />
            Reports ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No reports match your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-800 text-white">
                            {report.createdBy?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {report.createdBy?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateToDDMMYYYY(report.createdAt)}

                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(report.status)}
                        {getTypeBadge(report.type)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm" className="border-gray-300">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {reports.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 border-gray-300"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                      const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                      if (pageNum > pagination.totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pagination.page === pageNum
                              ? 'z-10 bg-gray-900 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900'
                              : 'text-gray-900 border-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 border-gray-300"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerReports;

