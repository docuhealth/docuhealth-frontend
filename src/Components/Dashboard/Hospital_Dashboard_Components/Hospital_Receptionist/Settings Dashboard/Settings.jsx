import React from 'react'
import TabComponent from './Components/TabComponent'
import tabs from './Components/TabDetails'


const Settings = () => {
  return (
    <>
      <div>
            <TabComponent tabs={tabs} />
        </div>
    </>

  )
}

export default Settings