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
        return <Badge className="bg-green-900 text-green-300 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-900 text-yellow-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-900 text-red-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-red-900 text-red-300">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-900 text-yellow-300">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-green-900 text-green-300">Low</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{priority}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-100 mb-2">Reports Management</h1>
            <p className="text-gray-400">Manage all system reports and documentation</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search reports by title or type..."
              className="pl-10 bg-gray-900 border-emerald-700 text-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Status</Button>
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Types</Button>
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Priorities</Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="bg-gray-800 border-emerald-900/30">
        <CardHeader className="border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <FileText className="w-5 h-5 text-emerald-500" />
              All Reports
            </h3>
            <p className="text-sm text-gray-400">Showing {reports.length} reports</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-emerald-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-emerald-100">{report.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
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
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardHeader className="border-b border-emerald-900/30 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <FileText className="w-5 h-5 text-emerald-500" />
              Financial Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="font-semibold text-emerald-100">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Approved</span>
                <span className="font-semibold text-green-400">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-400">2</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">View All</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardHeader className="border-b border-emerald-900/30 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <AlertCircle className="w-5 h-5 text-emerald-500" />
              Maintenance Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="font-semibold text-emerald-100">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Approved</span>
                <span className="font-semibold text-green-400">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-400">2</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">View All</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardHeader className="border-b border-emerald-900/30 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Security Reports
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="font-semibold text-emerald-100">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Approved</span>
                <span className="font-semibold text-green-400">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Rejected</span>
                <span className="font-semibold text-red-400">1</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">View All</Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold text-emerald-100">45</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Approved Reports</p>
                <p className="text-2xl font-bold text-emerald-100">38</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Reports</p>
                <p className="text-2xl font-bold text-emerald-100">5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected Reports</p>
                <p className="text-2xl font-bold text-emerald-100">2</p>
              </div>
              <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;