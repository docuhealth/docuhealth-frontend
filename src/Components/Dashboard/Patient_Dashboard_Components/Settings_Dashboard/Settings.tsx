import React from "react";
import { useSearchParams } from "react-router-dom";
import TabComponent from "./Components/TabComponent";
import tabs from './Components/TabDetails'

const Settings = () => {
    const [searchParams] = useSearchParams();
    const requestedTab = searchParams.get("tab");

    const initialTab = requestedTab
        ? Math.max(
            0,
            tabs.findIndex(
                (tab) => tab.title.toLowerCase().replace(/\s+/g, "-") === requestedTab.toLowerCase()
            )
        )
        : 0;

    return (
        <>
        <div>
            <TabComponent tabs={tabs} initialTab={initialTab} />
        </div>
        </>
    )
}

export default Settings;
