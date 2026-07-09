import React, { createContext } from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { fetchLabProfile } from "../../../queries/Hospital/lab/profile";

export const LabAppContext = createContext();

const LabProfileProvider = (props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["lab-dashboard"],
    queryFn:  fetchLabProfile,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  return (
    <LabAppContext.Provider
      value={{
        profile:         data?.lab_scientist ?? null,
        isLoading,
        backgroundImage: data?.theme?.bg_image ?? null,
        hospitalName:    data?.theme?.name ?? null,
        hospitalLogo:    data?.theme?.profile_image ?? null,
        stats: data?.summary ? {
          total_requests:       data.summary.total_orders,
          total_requests_trend: data.summary.total_orders_change,
          pending_tests:        data.summary.pending_orders,
          pending_tests_trend:  data.summary.pending_orders_change,
          completed_tests:      data.summary.completed_orders,
          completed_tests_trend: data.summary.completed_orders_change,
        } : null,
        recentPatients:  [],
      }}
    >
      {props.children}
    </LabAppContext.Provider>
  );
};

LabProfileProvider.propTypes = { children: PropTypes.node };

export default LabProfileProvider;
