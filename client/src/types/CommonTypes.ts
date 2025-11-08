export interface User {
    id: string;
    name: string;
    email: string;
    token: string;
}

export interface NavigationProps {
    goToNextSection: () => void;
    goToPreviousSection: () => void;
}

export interface GowthPartnerDetailsProps {
    growthPartnerAllData?: any;
    growthPartnerData: any;
    isOpen: boolean;
    onClose: () => void;
    setDetailPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}