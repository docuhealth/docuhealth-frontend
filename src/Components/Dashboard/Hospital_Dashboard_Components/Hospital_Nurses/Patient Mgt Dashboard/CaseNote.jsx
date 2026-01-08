import React, { useContext, useEffect, useState } from 'react'
import axiosInstance from "../../../../../utils/axiosInstance"
import toast from 'react-hot-toast'


const CaseNote = ({setCaseNoteHistory}) => {

    return (
        <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
               <div
                className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
                onClick={() => setCaseNoteHistory(false)}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                        fill="#1B2B40"
                    />
                </svg>

                <h2 className=" text-sm">Case Note History</h2>
            </div>
            <div className='border rounded-md p-5 my-5'>
                <div className='border-b pb-3'>
                <h2 className='font-medium '>Case Notes</h2>
                </div>
               
            </div>
        </div>
    )
}

export default CaseNote