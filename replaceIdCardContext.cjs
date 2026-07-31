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

const basePath = path.join(__dirname, 'src');

// 1. Patient_Home_Dashboard.jsx
replaceInFile(path.join(basePath, 'Dashboard', 'Patient_Dashboard', 'Patient_Home_Dashboard.jsx'), [
    { 
      from: `import { IdCardContext } from "../../context/PatientContext/IdCardContext";`, 
      to: `import { useIdCardStore } from "../../store/useIdCardStore";\nimport { useCreateIdCard } from "../../hooks/patients/useCreateIdCard";` 
    },
    { 
      from: `  const {\n    onboardIDCard,\n    setOnboardIDCard,\n    idCardData,\n    handleChange,\n    handleIDCardCreation,\n    isIDCreatedSuccessfully,\n    setIsIDCreatedSuccessfully,\n    handleSelection,\n    selectedProfile,\n  } = useContext(IdCardContext);`, 
      to: `  const {\n    onboardIDCard,\n    setOnboardIDCard,\n    idCardData,\n    handleChange,\n    isIDCreatedSuccessfully,\n    setIsIDCreatedSuccessfully,\n    handleSelection,\n    selectedProfile,\n  } = useIdCardStore();\n  const { mutate: handleIDCardCreation } = useCreateIdCard();` 
    }
]);

// 2. UserSubAcctRecords.jsx
replaceInFile(path.join(basePath, 'Components', 'Dashboard', 'Patient_Dashboard_Components', 'Sub_Acct_Dashboard', 'Components', 'UserSubAcctRecords.jsx'), [
    {
      from: `import { IdCardContext } from "../../../../../context/PatientContext/IdCardContext";`,
      to: `import { useIdCardStore } from "../../../../../store/useIdCardStore";`
    },
    {
      from: `  const {\n    handleSelection,\n  } = useContext(IdCardContext);`,
      to: `  const { handleSelection } = useIdCardStore();`
    }
]);

// 3. UserSubAcctRecordsMobile.jsx
replaceInFile(path.join(basePath, 'Components', 'Dashboard', 'Patient_Dashboard_Components', 'Sub_Acct_Dashboard', 'Components', 'UserSubAcctRecordsMobile.jsx'), [
    {
      from: `import { IdCardContext } from "../../../../../context/PatientContext/IdCardContext";`,
      to: `import { useIdCardStore } from "../../../../../store/useIdCardStore";`
    },
    {
      from: `  const {\n    handleSelection,\n  } = useContext(IdCardContext);`,
      to: `  const { handleSelection } = useIdCardStore();`
    }
]);

console.log("Done replacing IdCardContext");
