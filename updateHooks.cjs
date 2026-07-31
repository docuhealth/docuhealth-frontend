const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, 'src', 'hooks', 'patients');

const replacements = [
    {
        file: 'usePatientProfile.ts',
        from: `queryKey: ["patient-profile"]`,
        to: `queryKey: queryKeys.profile`
    },
    {
        file: 'usePatientVitalSigns.ts',
        from: `queryKey: ["vital-signs", page]`,
        to: `queryKey: queryKeys.vitalSigns(page)`
    },
    {
        file: 'useSubaccounts.ts',
        from: `queryKey: ["subAccounts", page, pageSize, search]`,
        to: `queryKey: queryKeys.subAccounts(page, pageSize, search)`
    },
    {
        file: 'usePatientAppointments.ts',
        from: `queryKey: ["appointments", page, pageSize, search, dateFrom, dateTo]`,
        to: `queryKey: queryKeys.appointments(page, pageSize, search, dateFrom, dateTo)`
    },
    {
        file: 'usePatientDrugRecords.ts',
        from: `queryKey: ["drugRecords", page, pageSize, search]`,
        to: `queryKey: queryKeys.drugRecords(page, pageSize, search)`
    },
    {
        file: 'usePatientMedicalRecords.ts',
        from: `queryKey: ["medicalRecords", page, pageSize, search]`,
        to: `queryKey: queryKeys.medicalRecords(page, pageSize, search)`
    },
    {
        file: 'useSubscriptionPlans.ts',
        from: `queryKey: ["patient-subscription-plans"]`,
        to: `queryKey: queryKeys.subscriptions`
    },
    {
        file: 'useCreateSubaccount.ts',
        from: `queryKey: ["subAccounts"]`,
        to: `queryKey: queryKeys.subAccountsList`
    },
    {
        file: 'useUpgradeSubaccount.ts',
        from: `queryKey: ["subAccounts"]`,
        to: `queryKey: queryKeys.subAccountsList`
    }
];

replacements.forEach(rep => {
    const filePath = path.join(hooksDir, rep.file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = `import { queryKeys } from "../../lib/queryKeys";\n` + content;
    content = content.replace(rep.from, rep.to);
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Hooks updated!");
