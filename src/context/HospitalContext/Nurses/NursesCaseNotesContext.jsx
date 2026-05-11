import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchPatientCaseNotes } from "../../../queries/Hospital/nurse/caseNotes";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const NursesCaseNotesContext = createContext();

const NursesCaseNotesProvider = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [patientHin, setPatientHin] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 7;

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isUserLoggedIn = !!getHospitalToken();

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["nurse-patient-case-notes-history", patientHin, currentPage, debouncedSearch],
        queryFn: fetchPatientCaseNotes,
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
                error?.response?.data?.message || "Error fetching case notes history",
            );
            console.error(error);
        }
    }, [isError, error]);

    const caseNotes = data?.results || [];
    const count = data?.count || 0;
    const totalPages = Math.ceil(count / pageSize);

    return (
        <NursesCaseNotesContext.Provider
            value={{
                caseNotes,
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
        </NursesCaseNotesContext.Provider>
    );
};

export default NursesCaseNotesProvider;
