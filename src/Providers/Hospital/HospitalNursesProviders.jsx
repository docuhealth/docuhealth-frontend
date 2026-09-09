import React from 'react'
import NursesProfileProvider from '../../context/HospitalContext/Nurses/NursesAppContext'
import NursesAdmittedPatientMGTProvider from '../../context/HospitalContext/Nurses/NursesAdmittedPatientMGTContext'
import NursesHealthPersonnelProvider from '../../context/HospitalContext/Nurses/NursesHealthPersonnelContext'
import NursesAppointmentsListProvider from '../../context/HospitalContext/Nurses/NursesAppointmentsListContext'
import NursesPatientsAssignedToWardProvider from '../../context/HospitalContext/Nurses/NursesPatientsAssignedToWardContext'
import NursesVitalSignsProvider from '../../context/HospitalContext/Nurses/NursesVitalSignsContext'
import NursesCaseNotesProvider from '../../context/HospitalContext/Nurses/NursesCaseNotesContext'
import NursingEncounterProvider from '../../context/HospitalContext/Nurses/NursingEncounterContext'

import HosStaffsProvider from '../../context/HospitalContext/HosStaffsContext'

const HospitalNursesProviders = ({ children }) => {
  return (
    <>
      <HosStaffsProvider >
        <NursesProfileProvider>
          <NursesAdmittedPatientMGTProvider>
            <NursesHealthPersonnelProvider>
              <NursesAppointmentsListProvider>
                <NursesPatientsAssignedToWardProvider>
                  <NursesVitalSignsProvider>
                    <NursesCaseNotesProvider>
                      <NursingEncounterProvider>
                        {children}
                      </NursingEncounterProvider>
                    </NursesCaseNotesProvider>
                  </NursesVitalSignsProvider>
                </NursesPatientsAssignedToWardProvider>
              </NursesAppointmentsListProvider>
            </NursesHealthPersonnelProvider>
          </NursesAdmittedPatientMGTProvider>
        </NursesProfileProvider>
      </HosStaffsProvider>
    </>
  )
}

export default HospitalNursesProviders