/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { AdminUsersContext } from "../../../../context/AdminContext/AdminUsersContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../SearchBar/SearchBar";
import toast from "react-hot-toast";
import { deactivateAdminHospital, deactivateAdminPatient, activateAdminHospital, activateAdminPatient } from "../../../../queries/admin/users";

const UsersListAdmin = ({ selectedUsers, setSelectedUsers }) => {
  const {
    selectedRole,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    users,
    count,
    totalPages,
    loading,
    isRefreshing,
  } = useContext(AdminUsersContext);

  const queryClient = useQueryClient();

  const [activeMenu, setActiveMenu] = useState(null);

  // Server handles filtering via debouncedSearch in context
  const selectableUsers = users;
  const allChecked = selectableUsers.length > 0 && selectedUsers.length === selectableUsers.length;

  const toggleSelectAll = () => {
    if (allChecked) {
      console.log("Deselected all users");
      setSelectedUsers([]);
    } else {
      const allIds = selectableUsers.map((u) => u.hin || u._id || u.id);
      setSelectedUsers(allIds);
    }
  };

  const toggleUser = (id) => {
    if (!id) {
      console.error("Error: This user member has no ID property!");
      return;
    }

    setSelectedUsers((prev) => {
      const isRemoving = prev.includes(id);
      if (isRemoving) {
        console.log(`Unchecked user ID: ${id}`);
        return prev.filter((item) => item !== id);
      } else {
        const userMember = users.find((u) => (u.hin || u._id || u.id) === id);
        console.log("Checked user:", userMember);
        return [...prev, id];
      }
    });
  };

  // ----- DEACTIVATION LOGIC -----
  const [userToDeactivate, setUserToDeactivate] = useState(null); // holds user object to confirm
  const [userToActivate, setUserToActivate] = useState(null); // holds user object to confirm
  
  const { mutate: deactivateHospital, isPending: isDeactivatingHospital } = useMutation({
    mutationFn: (hinsList) => deactivateAdminHospital(hinsList),
    onSuccess: () => {
      toast.success("Hospital(s) deactivated successfully");
      queryClient.invalidateQueries(["admin-users", "hospital"]);
      setUserToDeactivate(null);
      setSelectedUsers([]);
      setActiveMenu(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to deactivate hospital");
    }
  });

  const { mutate: deactivatePatient, isPending: isDeactivatingPatient } = useMutation({
    mutationFn: (idsList) => deactivateAdminPatient(idsList),
    onSuccess: () => {
      toast.success("User(s) deactivated successfully");
      queryClient.invalidateQueries(["admin-users", "patient"]);
      setUserToDeactivate(null);
      setSelectedUsers([]);
      setActiveMenu(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to deactivate user");
    }
  });

  const handleBulkDeactivate = () => {
    if (selectedUsers.length === 0) return toast.error("Please select users to deactivate");
    if (selectedRole === "hospital") deactivateHospital(selectedUsers);
    else deactivatePatient(selectedUsers);
  };

  const handleConfirmDeactivate = () => {
    if (!userToDeactivate) return;
    const id = userToDeactivate.hin || userToDeactivate._id || userToDeactivate.id;
    if (selectedRole === "hospital") {
      deactivateHospital([id]);
    } else {
      deactivatePatient([id]);
    }
  };

  const { mutate: activateHospital, isPending: isActivatingHospital } = useMutation({
    mutationFn: (hinsList) => activateAdminHospital(hinsList),
    onSuccess: () => {
      toast.success("Hospital(s) activated successfully");
      queryClient.invalidateQueries(["admin-users", "hospital"]);
      setUserToActivate(null);
      setSelectedUsers([]);
      setActiveMenu(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to activate hospital");
    }
  });

  const { mutate: activatePatient, isPending: isActivatingPatient } = useMutation({
    mutationFn: (idsList) => activateAdminPatient(idsList),
    onSuccess: () => {
      toast.success("User(s) activated successfully");
      queryClient.invalidateQueries(["admin-users", "patient"]);
      setUserToActivate(null);
      setSelectedUsers([]);
      setActiveMenu(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to activate user");
    }
  });

  const handleBulkActivate = () => {
    if (selectedUsers.length === 0) return toast.error("Please select users to activate");
    if (selectedRole === "hospital") activateHospital(selectedUsers);
    else activatePatient(selectedUsers);
  };

  const handleConfirmActivate = () => {
    if (!userToActivate) return;
    const id = userToActivate.hin || userToActivate._id || userToActivate.id;
    if (selectedRole === "hospital") {
      activateHospital([id]);
    } else {
      activatePatient([id]);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  return (
    <>
      {selectedUsers.length > 0 && (
        <div
          className={`transition-all duration-300 mb-4 flex items-center justify-between p-3 rounded-lg ${selectedUsers.length > 0
            ? "bg-docuhealth-primary/10 border border-docuhealth-primary/20 opacity-100"
            : "opacity-0 h-0 overflow-hidden"
            }`}
        >
          <p className="text-sm text-docuhealth-primary font-medium">
            {selectedUsers.length} user(s) selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkActivate}
              disabled={isActivatingHospital || isActivatingPatient || isDeactivatingHospital || isDeactivatingPatient}
              className={`${(isActivatingHospital || isActivatingPatient) ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2`}
            >
              {(isActivatingHospital || isActivatingPatient) ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Activating...
                </>
              ) : "Activate"}
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={isDeactivatingHospital || isDeactivatingPatient || isActivatingHospital || isActivatingPatient}
              className={`${(isDeactivatingHospital || isDeactivatingPatient) ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2`}
            >
              {(isDeactivatingHospital || isDeactivatingPatient) ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deactivating...
                </>
              ) : "Deactivate"}
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4 w-full">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      <div className="hidden lg:flex lg:flex-col">
        <div className="grid grid-cols-9 text-left text-xs bg-gray-100 py-5 rounded-md">
          <div className=" w-full pl-5 flex items-center gap-2 col-span-2 ">
            <input type="checkbox" checked={allChecked} disabled={selectableUsers.length === 0} onChange={toggleSelectAll} className="w-4 h-4 accent-docuhealth-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
            <p>Name</p>
          </div>
          {selectedRole === "hospital" ? (
            <>
              <p className="col-span-2">Address</p>
              <p>Email address</p>
              <p>No. of doctors</p>
              <p>Other personnel</p>
              <p>Status</p>
            </>
          ) : (
            <>
              <p className="col-span-2">Email address</p>
              <p>Phone number</p>
              <p>D.O.B</p>
              <p>Sex</p>
              <p>Status</p>
            </>
          )}
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery ? "No results found for your search." : "No users found."}
          </div>
        ) : (
          <div className="flex flex-col">
            {users.map((user, idx) => {
              const isHospital = selectedRole === "hospital";
              const currentId = user.hin || user._id || user.id;
              const isSelected = selectedUsers.includes(currentId);

              return (
                <div key={idx} className="grid grid-cols-9 items-center py-4 border-b border-b-gray-200 text-[12px] text-gray-700 text-left w-full hover:bg-gray-50">
                  <div className="font-semibold col-span-2 w-full pl-5 flex items-center gap-2">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleUser(currentId)} className="w-4 h-4 accent-docuhealth-primary cursor-pointer" />
                    {isHospital && user.profile_image ? (
                       <img src={user.profile_image.url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                    ) : null}
                    <p className="truncate pr-4" title={isHospital ? user.name : `${user.full_name}`}>
                      {isHospital ? user.name : `${user.full_name}`}
                    </p>
                  </div>

                  {isHospital ? (
                     <>
                       <p className=" truncate pr-4 col-span-2" title={[user.address, user.city, user.state].filter(Boolean).join(", ") || "NULL"}>
                         {[user.address, user.city, user.state].filter(Boolean).join(", ") || "NULL"}
                       </p>
                       <p className="truncate pr-4" title={user.email || "NULL"}>{user.email || "NULL"}</p>
                       <p>{user.doctors || "0"}</p>
                       <p>{user.other_personnel || "0"}</p>
                       <p className={`capitalize font-medium ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>{user.is_active ? 'Active' : 'Not Active'}</p>
                     </>
                  ) : (
                     <>
                       <p className="col-span-2 truncate pr-4" title={user.email || "NULL"}>{user.email || "NULL"}</p>
                       <p className="truncate pr-4">{user.phone_num || user.phone_number || "NULL"}</p>
                       <p className="truncate pr-4">{user.dob || "NULL"}</p>
                       <p className="capitalize">{user.gender || user.sex || "NULL"}</p>
                       <p className={`capitalize font-medium ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>{user.is_active ? 'Active' : 'Not Active'}</p>
                     </>
                  )}

                  <div className="relative flex justify-center">
                    <button onClick={() => setActiveMenu(activeMenu === currentId ? null : currentId)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg>
                    </button>
                    {activeMenu === currentId && (
                      <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-md shadow z-50 p-2">
                        {user.is_active ? (
                          <button 
                            onClick={() => {
                              setUserToDeactivate(user)
                            }} 
                            className="w-full text-left p-2 font-medium transition-colors hover:bg-red-50 text-red-600"
                          >
                            Deactivate Account
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setUserToActivate(user)
                            }} 
                            className="w-full text-left p-2 font-medium transition-colors hover:bg-green-50 text-green-600"
                          >
                            Activate Account
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="flex lg:hidden mb-2 justify-between items-center px-1">
        {selectableUsers.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
            <input type="checkbox" checked={allChecked} disabled={selectableUsers.length === 0} onChange={toggleSelectAll} className="w-4 h-4 accent-docuhealth-primary disabled:opacity-50 disabled:cursor-not-allowed" />
            Select All
          </label>
        )}
      </div>
      <div className="block lg:hidden space-y-4 my-4">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery ? "No results found for your search." : "No users found."}
          </div>
        ) : (
          users.map((user, idx) => {
            const isHospital = selectedRole === "hospital";
            const currentId = user.hin || user._id || user.id;
            const isSelected = selectedUsers.includes(currentId);

            return (
              <div key={idx} className={`bg-white border rounded-md p-4 transition-transform relative ${isSelected ? 'border-docuhealth-primary ring-1 ring-docuhealth-primary' : 'border-gray-200'}`}>
                
                {/* Checkbox overlay top-right */}
                <div className="absolute top-4 right-4 z-10">
                   <input type="checkbox" checked={isSelected} onChange={() => toggleUser(currentId)} className="w-5 h-5 accent-docuhealth-primary cursor-pointer" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-50 mb-3 pr-8">
                  {isHospital && user.profile_image ? (
                     <img src={user.profile_image.url} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                  ) : (
                     <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[14px] font-bold text-docuhealth-primary shrink-0">
                       {isHospital ? user.name?.[0]?.toUpperCase() : user.full_name?.[0]?.toUpperCase() || "U"}
                     </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {isHospital ? "Hospital" : "Patient"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {isHospital ? user.name : user.full_name}
                    </p>
                  </div>
                </div>

                 {/* Body Details */}
                 <div className="space-y-2 mb-4 text-[12px]">
                    {isHospital ? (
                      <>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Email:</span>
                            <span className="font-medium text-gray-700 text-right break-all">{user.email || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Address:</span>
                            <span className="font-medium text-gray-700 text-right">{[user.address, user.city, user.state].filter(Boolean).join(", ") || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Doctors:</span>
                            <span className="font-medium text-gray-700 text-right">{user.doctors || "0"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Other personnel:</span>
                            <span className="font-medium text-gray-700 text-right">{user.other_personnel || "0"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Status:</span>
                            <span className={`font-medium text-right capitalize ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>{user.is_active ? 'Active' : 'Not Active'}</span>
                         </div>
                      </>
                    ) : (
                      <>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Email:</span>
                            <span className="font-medium text-gray-700 text-right break-all">{user.email || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Phone:</span>
                            <span className="font-medium text-gray-700 text-right">{user.phone_num || user.phone_number || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">D.O.B:</span>
                            <span className="font-medium text-gray-700 text-right">{user.dob || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Sex:</span>
                            <span className="font-medium text-gray-700 text-right capitalize">{user.gender || user.sex || "N/A"}</span>
                         </div>
                         <div className="flex justify-between items-start gap-3">
                            <span className="text-gray-400 shrink-0">Status:</span>
                            <span className={`font-medium text-right capitalize ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>{user.is_active ? 'Active' : 'Not Active'}</span>
                         </div>
                      </>
                    )}
                 </div>

                 {/* Action Buttons */}
                 <div className="flex gap-2">
                    {user.is_active ? (
                      <button 
                        onClick={() => setUserToDeactivate(user)}
                        className="w-full rounded-full py-2.5 text-[12px] font-semibold transition-colors bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                      >
                        Deactivate Account
                      </button>
                    ) : (
                      <button 
                        onClick={() => setUserToActivate(user)}
                        className="w-full rounded-full py-2.5 text-[12px] font-semibold transition-colors bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                      >
                        Activate Account
                      </button>
                    )}
                 </div>
              </div>
            );
          })
        )}
      </div>


      <div className="mt-2">
         <Pagination2 count={count} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>

      {/* Deactivate Confirmation Popup */}
      {userToDeactivate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-sm text-gray-500 mb-6">
               Are you sure you want to deactivate <span className="font-semibold text-gray-800">{selectedRole === "hospital" ? userToDeactivate.name : userToDeactivate.full_name}</span>? They will no longer be able to access the platform.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDeactivate(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeactivatingHospital || isDeactivatingPatient}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeactivate}
                disabled={isDeactivatingHospital || isDeactivatingPatient}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
              >
                {(isDeactivatingHospital || isDeactivatingPatient) ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Popup */}
      {userToActivate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Activate User</h3>
            <p className="text-sm text-gray-500 mb-6">
               Are you sure you want to activate <span className="font-semibold text-gray-800">{selectedRole === "hospital" ? userToActivate.name : userToActivate.full_name}</span>? They will gain access to the platform.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToActivate(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isActivatingHospital || isActivatingPatient}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmActivate}
                disabled={isActivatingHospital || isActivatingPatient}
                className="flex-1 py-2.5 rounded-full bg-green-600 text-sm font-bold text-white hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
              >
                {(isActivatingHospital || isActivatingPatient) ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersListAdmin;
