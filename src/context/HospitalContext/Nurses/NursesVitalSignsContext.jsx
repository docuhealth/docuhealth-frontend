import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchPatientVitalSigns } from "../../../queries/Hospital/nurse/vitals";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const NursesVitalSignsContext = createContext();

const NursesVitalSignsProvider = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [patientHin, setPatientHin] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 7;

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isUserLoggedIn = !!getHospitalToken();

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["nurse-patient-vitals-history", patientHin, currentPage, debouncedSearch],
        queryFn: fetchPatientVitalSigns,
        enabled: isUserLoggedIn && !!patientHin,
        placeholderData: keepPreviousData,
    });

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

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
                searchQuery,
                setSearchQuery,
            }}
        >
            {props.children}
        </NursesVitalSignsContext.Provider>
    );
};

export default NursesVitalSignsProvider;
