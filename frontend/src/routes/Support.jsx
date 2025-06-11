import React from 'react'
import useAuthStore from '../store/authStore'
import SupportHead from '../components/SupportHead'

const Support = () => {
  const { authUser } = useAuthStore();
  return (
    <div>
      <SupportHead status={authUser.accountStatus} username={authUser.username}/>
    </div>
  )
}

export default Support