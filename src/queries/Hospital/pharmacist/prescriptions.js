import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPrescriptionDetail = async (sqid) => {
  const { data } = await axiosInstanceHos.get(`api/pharmacy/orders/${sqid}`);
  return data;
};

export const updateDrugDispenseStatus = async (payload) => {
  const { data } = await axiosInstanceHos.patch(`api/pharmacy/orders/dispense`, payload);
  return data;
};
