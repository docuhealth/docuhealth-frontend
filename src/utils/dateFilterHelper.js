export const getDatesForFilter = (filter) => {
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

    if (filter === "Daily") {
        startDate = today.toISOString().split("T")[0];
    } else if (filter === "Last 24hrs") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = yesterday.toISOString().split("T")[0];
    } else if (filter === "Weekly") {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        startDate = lastWeek.toISOString().split("T")[0];
    } else if (filter === "Monthly") {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        startDate = lastMonth.toISOString().split("T")[0];
    } else if (filter === "Yearly") {
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        startDate = lastYear.toISOString().split("T")[0];
    }
    return {start_date: startDate, end_date: endDate};
};
