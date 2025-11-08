import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { FileText, Search, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [pagination.page, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReports({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      setReports(response.data.reports || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-black text-white flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-gray-500 text-white flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-gray-300 text-gray-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-black text-white">High</Badge>;
      case 'Medium':
        return <Badge className="bg-gray-600 text-white">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-gray-400 text-gray-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-800">{priority}</Badge>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Reports Management</h1>
            <p className="text-gray-600">Manage all system reports and documentation</p>
          </div>
          <Button className="bg-black text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search reports by title or type..."
              className="pl-10 border border-gray-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Status</Button>
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Types</Button>
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Priorities</Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <FileText className="w-5 h-5" />
              All Reports
            </h3>
            <p className="text-sm text-gray-600">Showing {reports.length} reports</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report: any) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-black">{report.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.createdBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Next
          </Button>
        </div>
      )}

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <FileText className="w-5 h-5" />
              Financial Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Financial').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Financial' && r.status === 'Approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-gray-600">
                  {reports.filter(r => r.type === 'Financial' && r.status === 'Pending').length}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border border-gray-400 text-black hover:bg-gray-100">View All</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <AlertCircle className="w-5 h-5" />
              Maintenance Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Maintenance').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Maintenance' && r.status === 'Approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-gray-600">
                  {reports.filter(r => r.type === 'Maintenance' && r.status === 'Pending').length}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border border-gray-400 text-black hover:bg-gray-100">View All</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <CheckCircle className="w-5 h-5" />
              Security Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Security').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">
                  {reports.filter(r => r.type === 'Security' && r.status === 'Approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="font-semibold text-gray-400">
                  {reports.filter(r => r.type === 'Security' && r.status === 'Rejected').length}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border border-gray-400 text-black hover:bg-gray-100">View All</Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-black">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Reports</p>
                <p className="text-2xl font-bold text-black">
                  {reports.filter(r => r.status === 'Approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-black">
                  {reports.filter(r => r.status === 'Pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Reports</p>
                <p className="text-2xl font-bold text-black">
                  {reports.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;