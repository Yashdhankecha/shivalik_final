import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { FileText, Search, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock report data
  const reports = [
    { id: 1, title: 'Monthly Financial Report', type: 'Financial', date: '2023-11-30', author: 'John Doe', status: 'Approved', priority: 'High' },
    { id: 2, title: 'Community Maintenance Report', type: 'Maintenance', date: '2023-11-28', author: 'Jane Smith', status: 'Pending', priority: 'Medium' },
    { id: 3, title: 'Security Audit Report', type: 'Security', date: '2023-11-25', author: 'Mike Johnson', status: 'Rejected', priority: 'High' },
    { id: 4, title: 'Resident Satisfaction Survey', type: 'Survey', date: '2023-11-20', author: 'Sarah Williams', status: 'Approved', priority: 'Low' },
    { id: 5, title: 'Facility Usage Report', type: 'Facility', date: '2023-11-15', author: 'David Brown', status: 'Pending', priority: 'Medium' },
  ];

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
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-black">{report.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.author}
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
                <span className="font-semibold text-black">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-gray-600">2</span>
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
                <span className="font-semibold text-black">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-gray-600">2</span>
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
                <span className="font-semibold text-black">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-black">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="font-semibold text-gray-400">1</span>
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
                <p className="text-2xl font-bold text-black">45</p>
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
                <p className="text-2xl font-bold text-black">38</p>
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
                <p className="text-2xl font-bold text-black">5</p>
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
                <p className="text-2xl font-bold text-black">2</p>
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