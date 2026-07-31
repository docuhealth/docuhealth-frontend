import { create } from 'zustand';

interface IdCardData {
    fullName: string;
    firstEmergency: string;
    secondEmergency: string;
    emergencyAddress: string;
}

interface IdCardStore {
    onboardIDCard: boolean;
    setOnboardIDCard: (value: boolean) => void;
    
    isIDCreatedSuccessfully: boolean;
    setIsIDCreatedSuccessfully: (value: boolean) => void;
    
    idCardData: IdCardData;
    setIdCardData: (data: IdCardData | ((prev: IdCardData) => IdCardData)) => void;
    handleChange: (e: any) => void;
    
    selectedProfile: any;
    setSelectedProfile: (profile: any) => void;
    
    handleSelection: (selected: any) => void;
}

export const useIdCardStore = create<IdCardStore>((set) => ({
    onboardIDCard: false,
    setOnboardIDCard: (value) => set({ onboardIDCard: value }),
    
    isIDCreatedSuccessfully: false,
    setIsIDCreatedSuccessfully: (value) => set({ isIDCreatedSuccessfully: value }),
    
    idCardData: {
        fullName: "",
        firstEmergency: "",
        secondEmergency: "",
        emergencyAddress: "",
    },
    setIdCardData: (dataOrUpdater) => set((state) => ({
        idCardData: typeof dataOrUpdater === 'function' 
            ? dataOrUpdater(state.idCardData) 
            : dataOrUpdater
    })),
    
    handleChange: (e: any) => {
        const { name, value } = e.target;
        set((state) => ({
            idCardData: {
                ...state.idCardData,
                [name]: value
            }
        }));
    },
    
    selectedProfile: null,
    setSelectedProfile: (profile) => set({ selectedProfile: profile }),
    
    handleSelection: (selected) => set({
        onboardIDCard: true,
        selectedProfile: selected
    }),
}));
