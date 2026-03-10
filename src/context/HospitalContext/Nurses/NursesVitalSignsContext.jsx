import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchPatientVitalSigns } from "../../../queries/Hospital/nurse/vitals";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NursesVitalSignsContext = createContext();

const NursesVitalSignsProvider = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [patientHin, setPatientHin] = useState(null);
    const pageSize = 7;

    const isUserLoggedIn = !!getHospitalToken();

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["nurse-patient-vitals-history", patientHin, currentPage],
        queryFn: fetchPatientVitalSigns,
        enabled: isUserLoggedIn && !!patientHin,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (isError) {
            toast.error(
                error?.response?.data?.message || "Error fetching vitals history",
            );
            console.error(error);
        }
    }, [isError, error]);

    const vitals = data?.results || [];
    const count = data?.count || 0;
    const totalPages = Math.ceil(count / pageSize);

    return (
        <NursesVitalSignsContext.Provider
            value={{
                vitals,
                count,
                currentPage,
                setCurrentPage,
                totalPages,
                loading: isPending,
                isRefreshing: isFetching,
                setPatientHin,
                patientHin,
            }}
        >
            {props.children}
        </NursesVitalSignsContext.Provider>
    );
};

export default NursesVitalSignsProvider;
