import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Search, Plus, Edit, Trash2, Eye, MapPin, Users, X } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';

interface CommunityFormData {
  name: string;
  description: string;
  bannerImage: File | null;
  territory: string;
  status: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Indian states and cities data
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Delhi",
  "Puducherry"
];

const INDIAN_CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Bomdila", "Pasighat", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Raigarh"],
  "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Haryana": ["Chandigarh", "Faridabad", "Gurgaon", "Hisar", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Kullu"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Malappuram"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal", "Bishnupur", "Churachandpur", "Thoubal", "Ukhrul"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur"],
  "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Bikaner"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Rangpo", "Jorethang"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Pratapgarh", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Roorkee", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Andaman and Nicobar Islands": ["Port Blair", "Havelock", "Neil Island", "Diglipur", "Mayabunder"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Bitra"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    bannerImage: null, // Changed from string to File|null for image upload
    territory: '',
    status: 'active',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    // Removed totalUnits and occupiedUnits
    // managerId will be set to admin ID automatically on backend
  });
  const [dynamicFields, setDynamicFields] = useState([{ key: '', value: '' }]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null); // For image preview
  const [cities, setCities] = useState<string[]>([]); // Cities based on selected state
  const { toast } = useToast();

  // Update cities when state changes
  useEffect(() => {
    if (formData.location.state && INDIAN_CITIES_BY_STATE[formData.location.state]) {
      setCities(INDIAN_CITIES_BY_STATE[formData.location.state]);
    } else {
      setCities([]);
    }
  }, [formData.location.state]);

  useEffect(() => {
    fetchCommunities();
  }, [pagination.page, searchTerm]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdminCommunities({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      setCommunities(response.data.communities || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, bannerImage: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Name and description are required",
          variant: "destructive"
        });
        return;
      }

      // Prepare FormData for file upload
      const formDataObj = new FormData();
      
      // Add basic fields
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('territory', formData.territory);
      formDataObj.append('status', formData.status);
      // managerId is automatically set to admin on backend
      
      // Add location data as a nested object
      formDataObj.append('location', JSON.stringify(formData.location));
      
      // Add dynamic fields as a nested object
      if (dynamicFields.length > 0 && dynamicFields[0].key) {
        const dynamicFieldsObj = {};
        dynamicFields.forEach((field) => {
          if (field.key) {
            dynamicFieldsObj[field.key] = field.value;
          }
        });
        formDataObj.append('dynamicFields', JSON.stringify(dynamicFieldsObj));
      }

      // Handle file upload if bannerImage exists
      if (formData.bannerImage) {
        formDataObj.append('bannerImage', formData.bannerImage);
      }

      await adminApi.createCommunity(formDataObj);
      
      toast({
        title: "Success",
        description: "Community created successfully"
      });
      
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        bannerImage: null,
        territory: '',
        status: 'active',
        location: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      } as CommunityFormData);
      setDynamicFields([{ key: '', value: '' }]);
      setPreviewImage(null);
      
      // Refresh communities list
      fetchCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
      
      // Check if it's a connection error
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please make sure the backend server is running on port 11001.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Failed to create community",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteCommunity = async (id) => {
    try {
      await adminApi.deleteCommunity(id);
      
      toast({
        title: "Success",
        description: "Community deleted successfully"
      });
      
      // Refresh communities list
      fetchCommunities();
    } catch (error) {
      console.error('Error deleting community:', error);
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'active':
        return <Badge className="bg-black text-white">Active</Badge>;
      case 'Pending':
      case 'pending':
        return <Badge className="bg-gray-500 text-white">Pending</Badge>;
      case 'Inactive':
      case 'inactive':
        return <Badge className="bg-gray-300 text-gray-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-800">{status}</Badge>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const addDynamicField = () => {
    setDynamicFields([...dynamicFields, { key: '', value: '' }]);
  };

  const removeDynamicField = (index) => {
    const newFields = [...dynamicFields];
    newFields.splice(index, 1);
    setDynamicFields(newFields);
  };

  const updateDynamicField = (index, field, value) => {
    const newFields = [...dynamicFields];
    newFields[index][field] = value;
    setDynamicFields(newFields);
  };

  if (loading && communities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading communities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Community Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create New Community</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Community Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter community name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows={3}
                    placeholder="Enter community description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                  {previewImage && (
                    <div className="mb-2">
                      <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                  <Input
                    value={formData.territory}
                    onChange={(e) => setFormData({...formData, territory: e.target.value})}
                    placeholder="Enter territory"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={formData.location.address}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location, address: e.target.value }
                      })}
                      placeholder="Address"
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">State</label>
                      <select
                        value={formData.location.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value, city: '' }
                        })}
                        className="w-full border border-gray-300 rounded-md p-2"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <select
                        value={formData.location.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-md p-2"
                        disabled={!formData.location.state}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      value={formData.location.zipCode}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location, zipCode: e.target.value }
                      })}
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Dynamic Form Fields</label>
                    <Button variant="outline" size="sm" onClick={addDynamicField}>
                      Add Field
                    </Button>
                  </div>
                  
                  {dynamicFields.map((field, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={field.key}
                        onChange={(e) => updateDynamicField(index, 'key', e.target.value)}
                        placeholder="Field name"
                      />
                      <Input
                        value={field.value}
                        onChange={(e) => updateDynamicField(index, 'value', e.target.value)}
                        placeholder="Field value"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeDynamicField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button onClick={handleCreateCommunity}>Create Community</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Communities Management</h1>
            <p className="text-gray-600">Manage all residential communities and their details</p>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Community
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search communities by name or location..."
              className="pl-10 border border-gray-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Status</Button>
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Managers</Button>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {communities.map((community) => (
          <Card key={community._id} className="hover:shadow-lg transition-shadow bg-white border border-gray-300">
            <CardHeader className="border-b border-gray-300 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-black">{community.name}</h3>
                {getStatusBadge(community.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{community.location?.city || 'Not specified'}, {community.location?.state || 'Not specified'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>Manager: {community.managerId?.name || 'Not assigned'}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <Button variant="outline" size="sm" className="border border-gray-400 text-black hover:bg-gray-100">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border border-gray-400 text-black hover:bg-gray-100">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border border-gray-400 text-black hover:bg-gray-100"
                    onClick={() => handleDeleteCommunity(community._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Communities Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Building2 className="w-5 h-5" />
              All Communities
            </h3>
            <p className="text-sm text-gray-600">Showing {communities.length} communities</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {communities.map((community) => (
                  <tr key={community._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-black">{community.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {community.location?.city || 'Not specified'}, {community.location?.state || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {community.managerId?.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(community.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-black hover:bg-gray-100"
                          onClick={() => handleDeleteCommunity(community._id)}
                        >
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Communities</p>
                <p className="text-2xl font-bold text-black">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Communities</p>
                <p className="text-2xl font-bold text-black">
                  {communities.filter(c => c.status === 'active' || c.status === 'Active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Communities</p>
                <p className="text-2xl font-bold text-black">
                  {communities.filter(c => c.status === 'pending' || c.status === 'Pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Communities;