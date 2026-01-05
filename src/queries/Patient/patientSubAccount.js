import axiosInstance from "../../utils/axiosInstance";


export const fetchSubaccounts = async({ queryKey }) => {
    const [_key, page, pageSize] = queryKey;

    const res = await axiosInstance.get(
        `api/patients/subaccounts?page=${page}&size=${pageSize}`
      );
    
      return res.data
}