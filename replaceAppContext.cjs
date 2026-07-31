const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const rep of replacements) {
        content = content.replace(rep.from, rep.to);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const basePath = path.join(__dirname, 'src', 'Components', 'Dashboard', 'Patient_Dashboard_Components');

// 1. TabDetails.jsx
replaceInFile(path.join(basePath, 'Settings_Dashboard', 'Components', 'TabDetails.jsx'), [
    { from: `import { AppContext } from "../../../../../context/PatientContext/AppContext.jsx";`, to: `import { usePatientProfile } from "../../../../../hooks/patients/usePatientProfile";` },
    { from: `import { AppContext } from "../../../../../context/PatientContext/AppContext";`, to: `import { usePatientProfile } from "../../../../../hooks/patients/usePatientProfile";` },
    { from: `const { profile } = useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();` }
]);

// 2. Patient_Sidebar_Mobile.jsx
replaceInFile(path.join(basePath, 'Patient_Sidebar_Mobile.jsx'), [
    { from: `import { AppContext } from "../../../context/PatientContext/AppContext.jsx";`, to: `import { usePatientProfile } from "../../../hooks/patients/usePatientProfile";\nimport { useToggleEmergency } from "../../../hooks/patients/useToggleEmergency";` },
    { from: `const { profile, toggleEmergencyStatus, newEmergencyStatus } =\n    useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();\n  const { mutateAsync: toggleEmergencyStatus } = useToggleEmergency();` }
]);

// 3. Patient_Dashboard_Sidebar.jsx
replaceInFile(path.join(basePath, 'Patient_Dashboard_Sidebar.jsx'), [
    { from: `import { AppContext } from "../../../context/PatientContext/AppContext.jsx";`, to: `import { usePatientProfile } from "../../../hooks/patients/usePatientProfile";\nimport { useToggleEmergency } from "../../../hooks/patients/useToggleEmergency";` },
    { from: `const { profile, toggleEmergencyStatus, newEmergencyStatus } =\n    useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();\n  const { mutateAsync: toggleEmergencyStatus } = useToggleEmergency();` }
]);

// 4. Patient_Dashboard_Header.jsx
replaceInFile(path.join(basePath, 'Patient_Dashboard_Header.jsx'), [
    { from: `import { AppContext } from "../../../context/PatientContext/AppContext";`, to: `import { usePatientProfile } from "../../../hooks/patients/usePatientProfile";` },
    { from: `const { profile } = useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();` }
]);

// 5. MedicalRecords.jsx
replaceInFile(path.join(basePath, 'Home_Dashboard', 'MedicalRecords.jsx'), [
    { from: `import { AppContext } from "../../../../context/PatientContext/AppContext";\n`, to: `import { usePatientProfile } from "../../../../hooks/patients/usePatientProfile";\n` },
    { from: `const { profile } = useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();` }
]);

// 6. NoticeDisplay.jsx
replaceInFile(path.join(basePath, 'Home_Dashboard', 'Components', 'NoticeDisplay', 'NoticeDisplay.jsx'), [
    { from: `import { AppContext } from "../../../../../../context/PatientContext/AppContext";`, to: `import { usePatientProfile } from "../../../../../../hooks/patients/usePatientProfile";` },
    { from: `const { profile } = useContext(AppContext);`, to: `const { data: profile } = usePatientProfile();` }
]);

console.log("Done replacing AppContext");
