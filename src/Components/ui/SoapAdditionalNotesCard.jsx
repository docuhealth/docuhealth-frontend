import React from "react";
import PropTypes from "prop-types";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

// Standalone "Additional Notes" section of a SOAP note, rendered beneath the
// Treatment Plan. Each note carries the date/time it was attached.
const SoapAdditionalNotesCard = ({ additionalNotes }) => {
  return (
    <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
      <p className="font-medium mb-4 text-docuhealth-dark">Additional Notes</p>
      {additionalNotes?.length > 0 ? (
        <ul className="space-y-3">
          {additionalNotes.map((note, index) => {
            const text = typeof note === "object" ? note?.note : note;
            const createdAt = typeof note === "object" ? note?.created_at : null;
            return (
              <li
                key={note?.id ?? index}
                className="bg-white border rounded-lg px-4 py-3 text-[12px]"
              >
                <p className="text-gray-400 text-[11px] mb-1">
                  {createdAt ? formatFullDateTime(createdAt) : "Date not recorded"}
                </p>
                <p className="font-medium text-gray-800 whitespace-pre-wrap">
                  {text || "NIL"}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[12px] text-gray-500">NIL</p>
      )}
    </div>
  );
};

SoapAdditionalNotesCard.propTypes = {
  additionalNotes: PropTypes.array,
};

export default SoapAdditionalNotesCard;
