/* eslint-disable react/prop-types */
import { useContext, useState, useMemo } from "react";
import { AdminUsersContext } from "../../../../context/AdminContext/AdminUsersContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../SearchBar/SearchBar";
import toast from "react-hot-toast";
import { deactivateAdminHospital, deactivateAdminPatient } from "../../../../queries/admin/users";

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
    loading
  } = useContext(AdminUsersContext);

  const queryClient = useQueryClient();

  const [activeMenu, setActiveMenu] = useState(null);

  // Filter on frontend if the backend search isn't supported yet
  const displayedUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => {
      const searchStr = searchQuery.toLowerCase();
      const name = selectedRole === "hospital" ? u.name : `${u.firstname} ${u.lastname}`;
      return name?.toLowerCase().includes(searchStr) || u.email?.toLowerCase().includes(searchStr);
    });
  }, [users, searchQuery, selectedRole]);

  // --- SELECTION LOGIC ---

  const allChecked = displayedUsers.length > 0 && selectedUsers.length === displayedUsers.length;

  const toggleSelectAll = () => {
    if (allChecked) {
      console.log("Deselected all users");
      setSelectedUsers([]);
    } else {
      const allIds = displayedUsers.map((u) => (selectedRole === "hospital" ? u.hin : u.id));
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
        const userMember = displayedUsers.find((u) => (selectedRole === "hospital" ? u.hin : u.id) === id);
        console.log("Checked user:", userMember);
        return [...prev, id];
      }
    });
  };

  // ----- DEACTIVATION LOGIC -----
  const [userToDeactivate, setUserToDeactivate] = useState(null); // holds user object to confirm
  
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
    const id = selectedRole === "hospital" ? userToDeactivate.hin : userToDeactivate.id;
    if (selectedRole === "hospital") {
      deactivateHospital([id]);
    } else {
      deactivatePatient([id]);
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
            ? "bg-red-50 border border-red-100 opacity-100"
            : "opacity-0 h-0 overflow-hidden"
            }`}
        >
          <p className="text-sm text-red-700 font-medium">
            {selectedUsers.length} user(s) selected
          </p>
          <button
            onClick={handleBulkDeactivate}
            disabled={isDeactivatingHospital || isDeactivatingPatient}
            className={`${(isDeactivatingHospital || isDeactivatingPatient) ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2`}
          >
            {(isDeactivatingHospital || isDeactivatingPatient) ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deactivating...
              </>
            ) : "Deactivate Users"}
          </button>
        </div>
      )}
      
      <div className="mb-4 w-full">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
        />
      </div>

      <div className="hidden lg:flex lg:flex-col">
        <div className={`grid ${selectedRole === "hospital" ? "grid-cols-8" : "grid-cols-8"} text-left text-sm bg-gray-100 py-5 rounded-md`}>
          <div className=" w-full pl-5 flex items-center gap-2 col-span-2">
            <input type="checkbox" checked={allChecked} onChange={toggleSelectAll} className="w-4 h-4 accent-[#3E4095] cursor-pointer" />
            <p>Name</p>
          </div>
          {selectedRole === "hospital" ? (
            <>
              <p className="col-span-2">Address</p>
              <p>Email address</p>
              <p>No. of doctors</p>
              <p>Other personnel</p>
            </>
          ) : (
            <>
              <p className="col-span-2">Email address</p>
              <p>Phone number</p>
              <p>D.O.B</p>
              <p>Sex</p>
            </>
          )}
        </div>

        {displayedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No users found.</div>
        ) : (
          <div className="flex flex-col">
            {displayedUsers.map((user, idx) => {
              const isHospital = selectedRole === "hospital";
              const currentId = isHospital ? user.hin : user.id;
              const isSelected = selectedUsers.includes(currentId);

              return (
                <div key={idx} className={`grid grid-cols-8 items-center py-4 border-b border-b-gray-200 text-[12px] text-gray-700 text-left w-full hover:bg-gray-50`}>
                  <div className="font-semibold col-span-2 w-full pl-5 flex items-center gap-2">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleUser(currentId)} className="w-4 h-4 accent-[#3E4095] cursor-pointer" />
                    {isHospital && user.profile_image ? (
                       <img src={user.profile_image.url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                    ) : null}
                    <p className="truncate pr-4" title={isHospital ? user.name : `${user.firstname} ${user.lastname}`}>
                      {isHospital ? user.name : `${user.firstname} ${user.lastname}`}
                    </p>
                  </div>

                  {isHospital ? (
                     <>
                       <p className=" truncate pr-4 col-span-2" title={`${user.address || ''} ${user.city || ''} ${user.state || ''}`}>{`${user.address || ''} ${user.city || ''} ${user.state || ''}`}</p>
                       <p className="truncate pr-4" title={user.email}>{user.email}</p>
                       <p>{user.doctors || "NULL"}</p>
                       <p>{user.other_personnel || "NULL"}</p>
                     </>
                  ) : (
                     <>
                       <p className="col-span-2 truncate pr-4" title={user.email}>{user.email}</p>
                       <p className="truncate pr-4">{user.phone_num || user.phone_number || "NULL"}</p>
                       <p className="truncate pr-4">{user.dob || "NULL"}</p>
                       <p className="capitalize">{user.gender || user.sex || "NULL"}</p>
                     </>
                  )}

                  <div className="relative flex justify-center">
                    <button onClick={() => setActiveMenu(activeMenu === currentId ? null : currentId)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg>
                    </button>
                    {activeMenu === currentId && (
                      <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-md shadow z-50 p-2">
                        <button onClick={() => {
                          setUserToDeactivate(user)

                        }} className="w-full text-left p-2  hover:bg-red-50 text-red-600 font-medium">Deactivate Account</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
               Are you sure you want to deactivate <span className="font-semibold text-gray-800">{selectedRole === "hospital" ? userToDeactivate.name : `${userToDeactivate.firstname} ${userToDeactivate.lastname}`}</span>? They will no longer be able to access the platform.
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
    </>
  );
};

export default UsersListAdmin;
