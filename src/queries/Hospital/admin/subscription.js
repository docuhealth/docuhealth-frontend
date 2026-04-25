
import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchSubscriptionPlans = async () => {
     const res = await axiosInstanceHos.get("api/subscriptions/plans/role/hospital");
     return res.data
}