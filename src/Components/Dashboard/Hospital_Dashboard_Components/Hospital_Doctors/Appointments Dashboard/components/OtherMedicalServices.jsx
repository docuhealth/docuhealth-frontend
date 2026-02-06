import React, { useState } from 'react'
import toast from 'react-hot-toast'
import axiosInstanceHos from '../../../../../../utils/axiosInstanceHos'


const Pharmacist_Icon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.4818 3.51916C18.4344 5.47177 18.4344 8.63762 16.4818 10.5902L10.5893 16.4828C8.63659 18.4354 5.4708 18.4354 3.51817 16.4828C1.56556 14.5301 1.56556 11.3644 3.51817 9.41171L9.41076 3.51916C11.3633 1.56653 14.5292 1.56653 16.4818 3.51916ZM11.7683 12.9466L7.0543 8.23261L4.69669 10.5902C3.39494 11.892 3.39494 14.0025 4.69669 15.3043C5.99843 16.606 8.10898 16.606 9.41076 15.3043L11.7683 12.9466ZM15.3033 4.69766C14.0015 3.39591 11.891 3.39591 10.5893 4.69766L8.23281 7.0541L12.9468 11.7681L15.3033 9.41171C16.605 8.10996 16.605 5.99941 15.3033 4.69766Z" fill="#3E4095" />
    </svg>

)
const Lab_Personnel_Icon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.33366 13.3327V16.666H6.66699V18.3327H1.66699V13.3327H3.33366ZM18.3337 13.3327V18.3327H13.3337V16.666H16.667V13.3327H18.3337ZM6.25033 5.83268C6.25033 7.61735 7.49702 9.11085 9.16699 9.48977V14.166H10.8337L10.8345 9.4896C12.5041 9.11035 13.7503 7.61706 13.7503 5.83268H15.417C15.417 7.92209 14.234 9.73518 12.5012 10.6387L12.5003 15.8327H7.50033L7.50026 10.6391C5.76705 9.73577 4.58366 7.92242 4.58366 5.83268H6.25033ZM10.0003 4.16602C11.1509 4.16602 12.0837 5.09876 12.0837 6.24935C12.0837 7.39994 11.1509 8.33268 10.0003 8.33268C8.84974 8.33268 7.91699 7.39994 7.91699 6.24935C7.91699 5.09876 8.84974 4.16602 10.0003 4.16602ZM6.66699 1.66602V3.33268L3.33366 3.33185V6.66602H1.66699V1.66602H6.66699ZM18.3337 1.66602V6.66602H16.667V3.33268H13.3337V1.66602H18.3337Z" fill="#3E4095" />
    </svg>

)
const Radiologist_Icon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.9968 1.89025L13.7052 6.58122C13.9352 6.9798 13.7987 7.48946 13.4001 7.71957L12.3172 8.34386L13.1509 9.78794L11.7075 10.6213L10.8737 9.17719L9.79167 9.80294C9.39308 10.033 8.88342 9.89644 8.65333 9.49786L7.12183 6.84582C5.41152 7.36474 4.16667 8.95377 4.16667 10.8336C4.16667 11.3548 4.26233 11.8535 4.43706 12.3134C5.08267 11.9036 5.84702 11.6669 6.66667 11.6669C8.07007 11.6669 9.31142 12.3608 10.0664 13.4241L16.4734 9.72561L17.3068 11.169L10.7415 14.9594C10.8017 15.2414 10.8333 15.5338 10.8333 15.8336C10.8333 16.1192 10.8046 16.3981 10.7499 16.6675L17.5 16.6669V18.3336L3.33378 18.3346C2.81025 17.6381 2.5 16.7721 2.5 15.8336C2.5 14.9943 2.74818 14.2129 3.17517 13.5589C2.74397 12.7459 2.5 11.8183 2.5 10.8336C2.5 8.33752 4.06776 6.20762 6.27231 5.37484L5.94497 4.80692C5.48474 4.00977 5.75787 2.99045 6.55503 2.53021L8.72008 1.28021C9.51725 0.819973 10.5366 1.0931 10.9968 1.89025ZM6.66667 13.3336C5.28596 13.3336 4.16667 14.4529 4.16667 15.8336C4.16667 16.1258 4.21678 16.4063 4.30889 16.6669H9.02442C9.11658 16.4063 9.16667 16.1258 9.16667 15.8336C9.16667 14.4529 8.04737 13.3336 6.66667 13.3336ZM9.55342 2.72358L7.38835 3.97358L9.68 7.94287L11.8451 6.69287L9.55342 2.72358Z" fill="#3E4095" />
    </svg>

)
const Nurse_Icon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0008 12.4993C13.4005 12.4993 16.2058 15.0441 16.6159 18.3327H3.38574C3.79581 15.0441 6.60114 12.4993 10.0008 12.4993ZM8.48991 14.3989C7.29522 14.7777 6.28897 15.5938 5.66867 16.666H10.0008L8.48991 14.3989ZM11.5121 14.3991L10.0008 16.666H14.333C13.7127 15.5939 12.7067 14.7778 11.5121 14.3991ZM15.0008 1.66602V6.66602C15.0008 9.42743 12.7622 11.666 10.0008 11.666C7.23941 11.666 5.00083 9.42743 5.00083 6.66602V1.66602H15.0008ZM6.6675 6.66602C6.6675 8.50693 8.15988 9.99935 10.0008 9.99935C11.8418 9.99935 13.3342 8.50693 13.3342 6.66602H6.6675ZM13.3342 3.33268H6.6675L6.66741 4.99935H13.3341L13.3342 3.33268Z" fill="#3E4095" />
    </svg>

)

const OtherMedicalServices = ({ setOtherMedicalServices, selectedPatientDetails }) => {

    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false)
    const [staffList, setStaffList] = useState([]);
    const [isStaffSelected, setIsStaffSelected] = useState(false);

    const [formData, setFormData] = useState({
        staff_id: "",
        patient_hin: "",
        note: "",
    });

    const medicalServices = [
        {
            id: 1,
            title: "Request for vitals",
            subtitle: "Assign to Nurse",
            role: 'nurse',
            icon: <Nurse_Icon />,
        },
        {
            id: 2,
            title: "Order lab test",
            subtitle: "Request for lab test",
            role: 'lab_personnel',
            icon: <Lab_Personnel_Icon />, // replace with your SVG
        },
        {
            id: 3,
            title: "Prescribe drugs",
            subtitle: "Send to Pharmacist",
            role: 'pharmacist',
            icon: <Pharmacist_Icon />,
        },
        {
            id: 4,
            title: "Order Imaging",
            subtitle: "Order for imaging",
            role: 'radiologist',
            icon: <Radiologist_Icon />,
        },

    ]
    const handleAssign = (staffId) => {
        setIsStaffSelected(true); // show next card
        setFormData(prev => ({
            ...prev,
            staff_id: staffId,
        }));
        setFormData(prev => ({
            ...prev,
            patient_hin: selectedPatientDetails.patient.hin,
        }));
    };

    const handleSubmit = async () => {

        setLoading(true)

        if (selected != 'nurse') {
            toast.error('Feature coming soon')
            setLoading(false);
            return;
        }

        try {
            const res = await axiosInstanceHos.get(
                `api/receptionists/staff/${selected.toLowerCase()}`
            );

            const data = res.data;

            console.log(res.data)
            // Check if empty
            if (!data || data.length === 0) {
                toast.error(`No ${selected} currently available.`);
                setLoading(false);
                return;
            }

            // Store the data
            setStaffList(data);
            // setIsStaffSelectedRole(selected.toLowerCase());
            toast.success(`${selected} fetched successfully.`);
        } catch (err) {
            console.error("Error fetching medical personnel:", err);
            toast.error(err.response?.data?.message || "Error fetching medical personnel.");
        } finally {
            setLoading(false);
        }
    }

    const handleRequest = async () => {

        setRequestLoading(true)

        try {
            const res = await axiosInstanceHos.post('api/doctors/vital-signs/request', formData)
            console.log(res)
            toast.success('You have successfully assigned patient to a nurse for vitals checkup')
            setOtherMedicalServices(false)
            setRequestLoading(false)
        } catch (err) {
            console.error("Error assigning patient to nurse for vitals checkup:", err);
            toast.error(err.response?.data?.message || "Nurse vitals checkUp failed.");
            setOtherMedicalServices(false)
            setRequestLoading(false)
        } finally {
            setOtherMedicalServices(false)
            setRequestLoading(false)
        }
    }



    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
                {
                    staffList.length > 0 ? (
                        isStaffSelected ? (
                            <>
                                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setOtherMedicalServices(false)}
                                            className="text-gray-500 hover:text-black"
                                        >
                                            <i className="bx bx-x text-2xl cursor-pointer"></i>
                                        </button>
                                    </div>
                                    <h2 className="text-center font-semibold text-lg text-gray-800">Request for Vitals</h2>
                                    <p className="text-center text-gray-500 mb-4 text-sm">
                                    Assign to a nurse for vitals checkup
                                </p>
                                <div className="mb-2 text-[12px]">
                                    <p className="mb-1 text-gray-700 font-medium">Add note :</p>
                                    <textarea
                                        className="border rounded-lg w-full  h-[100px] p-3 text-[12px] outline-none focus:border-[#3E4095]"
                                        value={formData.note}
                                        onChange={(e) =>
                                            setFormData({ ...formData, note: e.target.value })
                                        }
                                        placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
                                    ></textarea>
                                </div>
                                <button
                                    disabled={requestLoading || !formData.note}
                                    className={`mt-6 w-full cursor-pointer bg-[#3E4095] text-white py-2 rounded-full disabled:bg-[#3E4095]/60 ${requestLoading ? 'bg-[#3E4095]/60 cursor-not-allowed' : ''}} text-sm `}
                                    onClick={handleRequest}
                                >
                                    {requestLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                            Processing Request
                                        </span>
                                    ) : (
                                        "Proceed"
                                    )}{" "}

                                </button>
                                </div>

                            </>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full relative text-sm">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <h2 className="font-medium">Choose a preferred {selected}</h2>
                                        {/* Close Button */}
                                        <div className="">
                                            <button
                                                onClick={() => setOtherMedicalServices(false)}
                                                className="text-gray-500 hover:text-black"
                                            >
                                                <i className="bx bx-x text-2xl cursor-pointer"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-col-3 my-5 text-sm gap-3">
                                        {staffList.map((staff, index) => (
                                            <div key={index} className="border rounded-md p-3">
                                                <div>
                                                    <div className="flex justify-between items-center border-b pb-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-blue-50 p-2 rounded-full">
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="#3E4095" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{staff.firstname + ' ' + staff.lastname}</p>
                                                                <p className="text-xs">{selected}</p>
                                                            </div>

                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{staff.staff_id}</p>
                                                        </div>
                                                    </div>

                                                    <div className="w-full pt-8">
                                                        <button className="w-full rounded-full border py-2 border-[#3E4095] text-[#3E4095] cursor-pointer"
                                                            onClick={() => handleAssign(staff.staff_id)}>
                                                            Assign patient
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )
                    ) : (
                        <>

                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
                                {/* Close Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setOtherMedicalServices(false)}
                                        className="text-gray-500 hover:text-black"
                                    >
                                        <i className="bx bx-x text-2xl cursor-pointer"></i>
                                    </button>
                                </div>
                                <h2 className="text-center font-semibold text-lg text-gray-800">Other Medical Services</h2>
                                <p className="text-center text-gray-500 mb-4 text-sm">
                                    Kindly select any other available options to proceed
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {
                                        medicalServices.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelected(item.role)}
                                                className={`border rounded-lg p-3 flex flex-col gap-2 text-left transition cursor-pointer 
${selected === item.role ? "border-[#3E4095] bg-blue-50" : "border-gray-200"}`}
                                            >
                                                <div className="flex justify-between items-center gap-2">
                                                    <div className="bg-blue-50 p-2 rounded-full">
                                                        {item.icon}
                                                    </div>


                                                    {/* Hidden radio input */}
                                                    <input
                                                        type="radio"
                                                        name="personnelType"
                                                        value={item.id}
                                                        checked={selected === item.role}
                                                        onChange={() => setSelected(item.id)}
                                                        className="hidden"
                                                    />

                                                    {/* Custom radio dot */}
                                                    <span
                                                        className={`w-4 h-4 rounded-full border-2 border-[#3E4095] flex items-center justify-center`}
                                                    >
                                                        {selected === item.role && (
                                                            <span className="w-2 h-2 rounded-full bg-[#3E4095]"></span>
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-gray-500 text-xs">{item.subtitle}</p>
                                            </button>
                                        ))}

                                </div>
                                <button
                                    disabled={!selected || loading}
                                    className={`mt-6 w-full cursor-pointer bg-[#3E4095] text-white py-2 rounded-full disabled:bg-[#3E4095]/60 ${loading ? 'bg-[#3E4095]/60 cursor-not-allowed' : ''}} text-sm `}
                                    onClick={handleSubmit}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                            Proceeding...
                                        </span>
                                    ) : (
                                        "Proceed"
                                    )}{" "}

                                </button>
                            </div>


                        </>
                    )
                }
            </div>

        </>
    )
}

export default OtherMedicalServices