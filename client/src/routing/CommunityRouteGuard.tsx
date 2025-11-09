import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Users } from 'lucide-react';

interface CommunityRouteGuardProps {
  children: React.ReactNode;
}

export const CommunityRouteGuard = ({ children }: CommunityRouteGuardProps) => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkMembership();
  }, [communityId, isAuthenticated]);

  const checkMembership = async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    // If user is not authenticated, show dialog
    if (!isAuthenticated) {
      setIsMember(false);
      setShowDialog(true);
      setLoading(false);
      return;
    }

    try {
      // Check if user is a member of the community
      const response = await communityApi.checkCommunityMembership(communityId);
      
      // Handle different response structures
      const membershipData = response.result || response.data || response;
      const isApprovedMember = membershipData?.isMember === true || membershipData?.isApproved === true;

      if (isApprovedMember) {
        setIsMember(true);
        setShowDialog(false);
      } else {
        setIsMember(false);
        setShowDialog(true);
      }
    } catch (error: any) {
      // If there's an error checking membership, show dialog
      console.error('Error checking membership:', error);
      setIsMember(false);
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = () => {
    setShowDialog(false);
    // Navigate to join request or show join form
    // For now, just navigate back to dashboard
    navigate('/dashboard');
  };

  const handleClose = () => {
    setShowDialog(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <>
        <Dialog open={showDialog} onOpenChange={(open) => {
          // Prevent closing by clicking outside - only allow button clicks
          if (!open) {
            handleClose();
          }
        }}>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">
                Join Community to Access
              </DialogTitle>
              <DialogDescription className="text-center mt-2">
                Please join the community to deep dive into this space. You need to be an approved member to access community features.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleJoinCommunity}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                Join Community
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
};

