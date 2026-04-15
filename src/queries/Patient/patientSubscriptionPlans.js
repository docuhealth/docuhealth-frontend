import axiosInstance from "../../utils/axiosInstance";


export const fetchSubscriptionPlans = async() => {
    const res = await axiosInstance.get('api/subscriptions/plans/role/patient')
    return res.data
    
}