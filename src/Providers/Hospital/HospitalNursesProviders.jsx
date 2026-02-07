import React from 'react'
import NursesProfileProvider from '../../context/Hospital Context/Nurses/NursesAppContext'
import NursesAdmittedPatientMGTProvider from '../../context/Hospital Context/Nurses/NursesAdmittedPatientMGTContext'
import NursesHealthPersonnelProvider from '../../context/Hospital Context/Nurses/NursesHealthPersonnelContext'
import NursesAppointmentsListProvider from '../../context/Hospital Context/Nurses/NursesAppointmentsListContext'
import NursesPatientsAssignedToWardProvider from '../../context/Hospital Context/Nurses/NursesPatientsAssignedToWardContext'

import HosStaffsProvider from '../../context/Hospital Context/HosStaffsContext'

const HospitalNursesProviders = ({ children }) => {
  return (
    <>
    <HosStaffsProvider >
      <NursesProfileProvider>
        <NursesAdmittedPatientMGTProvider>
          <NursesHealthPersonnelProvider>
            <NursesAppointmentsListProvider>
              <NursesPatientsAssignedToWardProvider>
                {children}
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