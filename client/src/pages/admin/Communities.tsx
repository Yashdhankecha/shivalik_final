import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Building2, Search, Plus, Edit, Trash2, Eye, MapPin, Users, X, UserPlus, XCircle, Calendar } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { getImageUrl } from '../../utils/imageUtils';

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
  const navigate = useNavigate();
  const { user, addUserRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>({
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
    },
  });
  const [dynamicFields, setDynamicFields] = useState([{ key: '', value: '' }]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const { toast } = useToast();

  // Add new state for manager assignment
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [managerUserId, setManagerUserId] = useState('');
  const [managerRole, setManagerRole] = useState('Manager');
  
  // Add state for community managers
  const [communityManagers, setCommunityManagers] = useState<Record<string, any[]>>({});
  
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCommunity, setDeleteCommunity] = useState<any>(null);
  
  // Add state for detailed community view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCommunity, setViewCommunity] = useState<any>(null);

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
      
      console.log('Communities response:', response);
      
      // Handle different response formats
      // Backend returns: { message: "...", result: { communities: [...], pagination: {...} } }
      let communitiesData = [];
      let paginationData = pagination;
      
      if (response?.result) {
        // Direct result object
        communitiesData = response.result.communities || [];
        paginationData = response.result.pagination || pagination;
      } else if (response?.data?.result) {
        // Nested result in data
        communitiesData = response.data.result.communities || [];
        paginationData = response.data.result.pagination || pagination;
      } else if (response?.data?.communities) {
        // Direct data.communities
        communitiesData = response.data.communities;
        paginationData = response.data.pagination || pagination;
      } else if (response?.communities) {
        // Direct communities array
        communitiesData = response.communities;
        paginationData = response.pagination || pagination;
      } else if (Array.isArray(response?.data)) {
        // Array directly in data
        communitiesData = response.data;
      } else if (Array.isArray(response)) {
        // Array directly
        communitiesData = response;
      }
      
      console.log('Parsed communities:', communitiesData);
      console.log('Parsed pagination:', paginationData);
      
      setCommunities(communitiesData);
      setPagination(paginationData);
      
      // Fetch managers for each community
      const managersData: Record<string, any[]> = {};
      for (const community of communitiesData) {
        try {
          const managersResponse = await adminApi.getCommunityManagers(community._id, {
            page: 1,
            limit: 10
          });
          
          // Handle managers response format
          let managers = [];
          if (managersResponse?.result?.managers) {
            managers = managersResponse.result.managers;
          } else if (managersResponse?.data?.managers) {
            managers = managersResponse.data.managers;
          } else if (managersResponse?.managers) {
            managers = managersResponse.managers;
          } else if (Array.isArray(managersResponse?.data)) {
            managers = managersResponse.data;
          } else if (Array.isArray(managersResponse)) {
            managers = managersResponse;
          }
          
          managersData[community._id] = managers;
        } catch (error) {
          console.error(`Error fetching managers for community ${community._id}:`, error);
          managersData[community._id] = [];
        }
      }
      setCommunityManagers(managersData);
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

  const openManagerModal = (community: any) => {
    setSelectedCommunity(community);
    setShowManagerModal(true);
    setManagerUserId('');
    setManagerRole('Manager');
  };

  const handleAssignManager = async () => {
    if (!selectedCommunity || !managerUserId) {
      toast({
        title: "Validation Error",
        description: "Please select a user to assign as manager",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await adminApi.assignCommunityManager({
        communityId: selectedCommunity._id,
        userId: managerUserId,
        role: 'Manager' // Always assign as Manager role
      });

      toast({
        title: "Success",
        description: "Manager assigned successfully"
      });

      setShowManagerModal(false);
      setSelectedCommunity(null);
      setManagerUserId('');
      fetchCommunities(); // Refresh the list
      
      // Update the user's role in the auth context if this is the current user
      if (user && user.id === managerUserId) {
        if (addUserRole) {
          addUserRole('Manager');
        }
      }
    } catch (error) {
      console.error('Error assigning manager:', error);
      toast({
        title: "Error",
        description: "Failed to assign manager",
        variant: "destructive"
      });
    }
  };

  const handleRemoveManager = async (communityId: string, managerId: string) => {
    try {
      await adminApi.removeCommunityManager(communityId, managerId);
      
      toast({
        title: "Success",
        description: "Manager removed successfully"
      });
      
      // Refresh managers for this community
      const managersResponse = await adminApi.getCommunityManagers(communityId, {
        page: 1,
        limit: 10
      });
      setCommunityManagers(prev => ({
        ...prev,
        [communityId]: managersResponse.data.managers || []
      }));
      
      fetchCommunities(); // Refresh the list
    } catch (error) {
      console.error('Error removing manager:', error);
      toast({
        title: "Error",
        description: "Failed to remove manager",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUser = async (communityId: string, userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await adminApi.removeUserFromCommunity(communityId, userId);
      
      toast({
        title: "Success",
        description: "User removed from community successfully"
      });
      
      fetchCommunities(); // Refresh the list
    } catch (error) {
      console.error('Error removing user from community:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from community",
        variant: "destructive"
      });
    }
  };

  const openDeleteModal = (community: any) => {
    setDeleteCommunity(community);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteCommunity) return;
    
    try {
      await handleDeleteCommunity(deleteCommunity._id);
      setShowDeleteModal(false);
      setDeleteCommunity(null);
    } catch (error) {
      console.error('Error deleting community:', error);
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive"
      });
    }
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
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
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
        </div>
      </div>

      {/* Communities Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Building2 className="w-5 h-5" />
              Communities
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {communities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No communities found. {pagination.total === 0 ? 'There are no communities yet.' : 'Try adjusting your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  communities.map((community: any) => (
                    <tr key={community._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {community.bannerImage ? (
                            <img 
                              src={getImageUrl(community.bannerImage)} 
                              alt={community.name} 
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-black">{community.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {community.location?.city && community.location?.state ? (
                          `${community.location.city}, ${community.location.state}`
                        ) : (
                          'Not specified'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Display existing managers */}
                          {communityManagers[community._id] && communityManagers[community._id].length > 0 ? (
                            communityManagers[community._id].map((manager: any) => (
                              <div key={manager._id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-gray-800 text-white text-xs">
                                      {manager.userId?.name ? manager.userId.name.charAt(0) : 'M'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-black">{manager.userId?.name || 'Unknown'}</p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleRemoveManager(community._id, manager._id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No managers assigned</p>
                          )}
                          
                          {/* Add manager button */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => openManagerModal(community)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Manager
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {community.members?.length || 0} members
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
                            onClick={() => {
                              setViewCommunity(community);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => {
                              const userId = prompt('Enter the User ID to remove from this community:');
                              if (userId) {
                                handleRemoveUser(community._id, userId);
                              }
                            }}
                          >
                            Remove User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* Manager Assignment Modal */}
      {showManagerModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Assign Manager</h3>
                <Button variant="ghost" onClick={() => setShowManagerModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Community: <span className="font-semibold">{selectedCommunity.name}</span>
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter user ID"
                    value={managerUserId}
                    onChange={(e) => setManagerUserId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the user ID of the person you want to assign as manager
                  </p>
                </div>
                
                {/* Hidden input to always set role as Manager */}
                <input type="hidden" value="Manager" />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowManagerModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={handleAssignManager}
                >
                  Assign Manager
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Community View Modal */}
      {showViewModal && viewCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8 shadow-2xl">
            {/* Close Button */}
            <div className="flex justify-end p-4 border-b border-gray-200">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowViewModal(false);
                  setViewCommunity(null);
                }}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Hero Image Section - Large Area */}
            <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {viewCommunity.bannerImage ? (
                <img 
                  src={getImageUrl(viewCommunity.bannerImage)} 
                  alt={viewCommunity.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-white opacity-50" />
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Community Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(viewCommunity.status)}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {viewCommunity.name}
                </h2>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Location Section - Large Fonts */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Location</h3>
                    <div className="space-y-2">
                      {viewCommunity.location?.address && (
                        <p className="text-lg md:text-xl font-semibold text-gray-900">
                          {viewCommunity.location.address}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {viewCommunity.location?.city && (
                          <span className="text-lg md:text-xl font-bold text-gray-900">
                            {viewCommunity.location.city}
                          </span>
                        )}
                        {viewCommunity.location?.city && viewCommunity.location?.state && (
                          <span className="text-lg md:text-xl text-gray-600">,</span>
                        )}
                        {viewCommunity.location?.state && (
                          <span className="text-lg md:text-xl font-bold text-gray-900">
                            {viewCommunity.location.state}
                          </span>
                        )}
                        {viewCommunity.location?.zipCode && (
                          <span className="text-lg md:text-xl text-gray-600">
                            {viewCommunity.location.zipCode}
                          </span>
                        )}
                        {viewCommunity.location?.country && (
                          <span className="text-lg md:text-xl text-gray-600">
                            {viewCommunity.location.country}
                          </span>
                        )}
                      </div>
                      {!viewCommunity.location?.city && !viewCommunity.location?.state && (
                        <p className="text-lg md:text-xl text-gray-500 italic">Location not specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {viewCommunity.description && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-900" />
                    About Community
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                    {viewCommunity.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Members Count */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold text-gray-900">{viewCommunity.members?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Territory */}
                {viewCommunity.territory && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Territory</p>
                        <p className="text-xl font-bold text-gray-900">{viewCommunity.territory}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Established Year */}
                {viewCommunity.establishedYear && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Established</p>
                        <p className="text-xl font-bold text-gray-900">{viewCommunity.establishedYear}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Units */}
                {viewCommunity.totalUnits && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Units</p>
                        <p className="text-xl font-bold text-gray-900">{viewCommunity.totalUnits}</p>
                        {viewCommunity.occupiedUnits !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            {viewCommunity.occupiedUnits} occupied
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Managers Section */}
              {communityManagers[viewCommunity._id] && communityManagers[viewCommunity._id].length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-900" />
                    Community Managers
                  </h3>
                  <div className="space-y-3">
                    {communityManagers[viewCommunity._id].map((manager: any) => (
                      <div key={manager._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-900 text-white">
                            {manager.userId?.name ? manager.userId.name.charAt(0) : 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{manager.userId?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{manager.userId?.email || 'No email'}</p>
                        </div>
                        <Badge className="bg-gray-900 text-white">Manager</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {viewCommunity.contactInfo && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewCommunity.contactInfo.email && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                        <p className="text-base text-gray-900">{viewCommunity.contactInfo.email}</p>
                      </div>
                    )}
                    {viewCommunity.contactInfo.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Phone</p>
                        <p className="text-base text-gray-900">{viewCommunity.contactInfo.phone}</p>
                      </div>
                    )}
                    {viewCommunity.contactInfo.website && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600 mb-1">Website</p>
                        <a 
                          href={viewCommunity.contactInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:underline"
                        >
                          {viewCommunity.contactInfo.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowViewModal(false);
                    setViewCommunity(null);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Community Modal */}
      {showDeleteModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Delete Community</h3>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to delete the community <span className="font-semibold">{selectedCommunity.name}</span>?
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Delete Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      
    </div>
  );
};

export default Communities;