import React from "react";

const UserSubAcctOverlay = ({showOverlay, handleSubmit, toggleOverlay, handleChange, formData, loading}) => {
  return (
    <div className="">
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            {/* Cancel Icon */}
            <div className="flex justify-between items-center pb-8">
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold">Create Sub Account</h2>
              </div>
              <button
                onClick={toggleOverlay}
                className="text-gray-500 hover:text-black"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className=" sm:grid sm:grid-cols-2 sm:gap-3"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF] "
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="mb-4 col-span-2">
                <p className="block text-sm font-medium text-gray-700 mb-1">
                  Please Note :
                </p>

                <div
                  className="text-sm text-gray-500 mt-2 border border-gray-300 rounded-lg p-3
                                  "
                >
                  Please note that once this account is created, its information
                  cannot be edited. However, you will have the option to update
                  the account details when you upgade the account and transfer
                  ownership to the child.
                </div>
              </div>
              <div className="col-span-2 text-center bg-[#0000FF] text-white py-3 px-4 rounded-full">
                <button type="submit" onClick={handleChange}>
                  {loading ? loading : "Create Sub Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubAcctOverlay;
