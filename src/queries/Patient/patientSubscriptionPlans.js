import axiosInstance from "../../utils/axiosInstance";


export const fetchSubscriptionPlans = async() => {
    const res = await axiosInstance.get('api/subscriptions/plans')
    console.log(res.data)
    return res.data
    
}