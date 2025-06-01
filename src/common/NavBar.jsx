import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { IoShareSocial } from "react-icons/io5";


const NavBar = () => {

  const handleAppShare = async () => {

    const shareData = {
      title: "Check out this App!",
      text: "This app is amazing - give it a try!",
      url: window.location.href,
    }

    if(navigator.share){
      try{
        await navigator.share(shareData);
      }catch(error){
        console.error("Error sharing");
      }
    } else {
      // copy to clipboard
      try{
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link Copied to Clipboard!")
      }catch(error){
        console.error("")
      }
    }
  }
  return (
    <>
    <nav className='navbar'>
      <div className='logo-container'>
        <div className="logo"><img src="/images/logo.png" alt="" /></div>
        <div className="navbar-brand">SayMyName</div>
        </div>
        <div className="share-app-button">
          <button onClick={handleAppShare}>
            <IoShareSocial />
            <Toaster />
          </button>
        </div>
    </nav>
    </>
  )
}

export default NavBar