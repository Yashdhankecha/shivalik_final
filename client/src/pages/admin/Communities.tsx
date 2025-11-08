import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Search, Plus, Edit, Trash2, Eye, MapPin, Users } from 'lucide-react';

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock community data
  const communities = [
    { id: 1, name: 'Green Valley Apartments', location: 'Mumbai, Maharashtra', units: 120, occupied: 95, status: 'Active', manager: 'John Doe' },
    { id: 2, name: 'Sunset Hills Condos', location: 'Delhi, Delhi', units: 85, occupied: 78, status: 'Active', manager: 'Jane Smith' },
    { id: 3, name: 'Oakwood Park Villas', location: 'Bangalore, Karnataka', units: 200, occupied: 150, status: 'Active', manager: 'Mike Johnson' },
    { id: 4, name: 'Pine Grove Residency', location: 'Chennai, Tamil Nadu', units: 95, occupied: 82, status: 'Pending', manager: 'Sarah Williams' },
    { id: 5, name: 'Royal Gardens', location: 'Hyderabad, Telangana', units: 150, occupied: 120, status: 'Active', manager: 'David Brown' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-900 text-green-300">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-900 text-yellow-300">Pending</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-900 text-gray-300">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-100 mb-2">Communities Management</h1>
            <p className="text-gray-400">Manage all residential communities and their details</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
            <Plus className="w-4 h-4 mr-2" />
            Add New Community
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search communities by name or location..."
              className="pl-10 bg-gray-900 border-emerald-700 text-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Status</Button>
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Managers</Button>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {communities.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-emerald-100">{community.name}</h3>
                {getStatusBadge(community.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{community.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{community.occupied}/{community.units} Units Occupied</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Manager: {community.manager}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-emerald-900/20 flex justify-between">
                <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Communities Table */}
      <Card className="bg-gray-800 border-emerald-900/30">
        <CardHeader className="border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <Building2 className="w-5 h-5 text-emerald-500" />
              All Communities
            </h3>
            <p className="text-sm text-gray-400">Showing {communities.length} communities</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-emerald-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {communities.map((community) => (
                  <tr key={community.id} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-emerald-100">{community.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {community.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {community.occupied}/{community.units}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {community.manager}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(community.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/30">
                          <Trash2 className="w-4 h-4" />
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Communities</p>
                <p className="text-2xl font-bold text-emerald-100">45</p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Communities</p>
                <p className="text-2xl font-bold text-emerald-100">42</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Communities</p>
                <p className="text-2xl font-bold text-emerald-100">3</p>
              </div>
              <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Units</p>
                <p className="text-2xl font-bold text-emerald-100">8,450</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Communities;