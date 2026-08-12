export const queryKeys = {
    profile: ["patient-profile"],
    vitalSigns: (page: number) => ["vital-signs", page],
    subAccounts: (page?: number, pageSize?: number, search?: string) => ["subAccounts", page, pageSize, search].filter(Boolean),
    subAccountsList: ["subAccounts"],
    appointments: (page?: number, pageSize?: number, search?: string, dateFrom?: string, dateTo?: string) => ["appointments", page, pageSize, search, dateFrom, dateTo].filter(Boolean),
    drugRecords: (page?: number, pageSize?: number, search?: string) => ["drugRecords", page, pageSize, search].filter(Boolean),
    medicalRecords: (page?: number, pageSize?: number, search?: string) => ["medicalRecords", page, pageSize, search].filter(Boolean),
    subscriptions: ["patient-subscription-plans"],
    subaccountMedicalRecords: (hin?: string, page?: number, pageSize?: number) => ["subaccountMedicalRecords", hin, page, pageSize].filter(Boolean),
};
