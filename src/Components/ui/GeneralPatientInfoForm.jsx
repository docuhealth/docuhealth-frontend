import React from "react";
import PropTypes from "prop-types";
import Input from "./Input";

const GeneralPatientInfoForm = ({ patient, children }) => {
  return (
    <div className="my-5 bg-docuhealth-light-gray rounded-xl border p-4">
      <h2 className="font-medium">General Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input label="First Name" readOnly value={patient?.firstname || ""} />

        <Input label="Last Name" readOnly value={patient?.lastname || ""} />

        <Input label="Date of birth" readOnly value={patient?.dob || ""} />

        <Input label="Email address" readOnly value={patient?.email || "NIL"} />

        <Input label="Phone number" readOnly value={patient?.phone_num || ""} />

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Home address
          </p>
          <textarea
            readOnly
            rows={3}
            className="w-full text-gray-500 rounded-lg text-sm bg-white border px-3 py-2 resize-none"
            value={
              patient?.street
                ? `${patient.street}, ${patient.city}, ${patient.state}, ${patient.country}`
                : "NIL"
            }
          />
        </div>

        {/* Custom fields for specific dashboards will be injected here */}
        {children}
      </div>
    </div>
  );
};

GeneralPatientInfoForm.propTypes = {
  patient: PropTypes.object,
  children: PropTypes.node,
};

export default GeneralPatientInfoForm;
