import React from 'react'
import { ArrowLeft } from 'lucide-react'

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp }) => {

    console.log(selected)
    return (
        <>
            <div className='flex items-center gap-1 cursor-pointer border-b pb-3' >
                <div
                    onClick={() => {
                        setAdvanceCheckUp(false)
                    }}>
                    <ArrowLeft className='w-4 h-4 text-gray-800' />
                </div>

                <p>Advance CheckUp</p>
            </div>
        </>
    )
}

export default AdvanceCheckUp