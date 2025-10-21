const UserUpgradeSubAcctNotification = ({ subAcctUpgradeSuccessNot, setSubAcctUpgradeSuccessNot }) => {
    return (
        <>
            <div>
                {
                    subAcctUpgradeSuccessNot && (
                        <>
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm">


                                <div className="bg-white rounded-lg shadow-lg">
                                    <div className="flex justify-end py-3 px-4">
                                    <button
                                        onClick={() => { setSubAcctUpgradeSuccessNot(false) }}
                                        className="text-gray-500 hover:text-black "
                                    >
                                        <i className="bx bx-x text-2xl"></i>
                                    </button>
                                    </div>
                                  


                                    <div className=" pb-6 px-14  flex flex-col justify-center items-center">

                                        <div className="pb-2">

                                            <svg width="70" height="71" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="50" cy="50.4014" r="50" fill="#0B6011" />
                                                <path d="M44.6659 58.857L69.1789 34.344L72.9501 38.1152L44.6659 66.3994L27.6953 49.429L31.4666 45.6578L44.6659 58.857Z" fill="white" />
                                            </svg>

                                        </div>
                                        <p className="text-[#0B6011] mb-4 text-sm sm:text-sm ">
                                            Account Upgrade Successful
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
        </>
    )
}

export default UserUpgradeSubAcctNotification