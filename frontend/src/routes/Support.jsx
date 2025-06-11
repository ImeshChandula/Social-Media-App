import React from 'react'
import useAuthStore from '../store/authStore'
import SupportHead from '../components/SupportHead'
import SupportChangeStatus from '../components/SupportChangeStatus';
import SupportBanned from '../components/SupportBanned';

const Support = () => {
  const { authUser } = useAuthStore();
  return (
    <div>
      <SupportHead status={authUser.accountStatus} username={authUser.username}/>
      {authUser.accountStatus === "inactive" ? (
        <SupportChangeStatus />
      ) : (
        <SupportBanned />
      )}
    </div>
  )
}

export default Support