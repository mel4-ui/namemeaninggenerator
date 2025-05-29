import React, { useEffect, useState } from 'react'
import { db } from './services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import html2canvas from "html2canvas"
import generateMeaning from './services/ai';
import NavBar from './common/NavBar';
import "./App.css"
import { FaArrowRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown"
import { MdOutlineFileDownload } from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";



const App = () => {
  const [name, setName] = useState("")
  const [data, setData] = useState(null)
  const [partsOfResponse, setPartsOfResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [bgColor, setBgColor] = useState("#ffffff")

  useEffect(() => {
    const generateImage = async () => {
      const element = document.getElementById("sharable-image");
      if(!element) return;

      const canvas = await html2canvas(element, {
        scale: 2
      });

      const image = canvas.toDataURL("image/png")
      setImageUrl(image)
    }

    if(partsOfResponse){
      generateImage()
    }
  }, [partsOfResponse])
  

  const pastelColors = [
  "#ffd1dc", // light pink
  "#c1f0f6", // pale blue
  "#e0bbf9", // light purple
  "#d4fc79", // light green
  "#fef9c7", // soft yellow
  "#ffc5bf", // salmon pink
  "#b5ead7", // mint green
  "#ffdac1", // peach
  "#c7ceea", // lavender blue
];

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(!name.trim() || name === ""){
      alert("Please Enter a name to contiue.")
      return
    }

    //pick a random pastel color
    const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    setBgColor(randomColor)



    setLoading(true)
    const response = await generateMeaning(name)
    setData(response.text)
    setPartsOfResponse(makePartsOfResponse(response.text))
    setLoading(false)
    await saveToFirestore(name, response.text)
  }

 

const makePartsOfResponse = (responseText) => {

  const introMatch = responseText.match(/^(.*)?\n\n/); 
  const meaningMatch = responseText.match(/Meaning:\s*(.+?)\n/i);
  const pronunciationMatch = responseText.match(/Pronunciation:\s*(.+?)\n/i);
  const messageMatch = responseText.match(/Message:\s*(.+?)\n/i);
  const nicknamesMatch = responseText.match(/Nicknames:\s*(.+)/i);


  
  const parts = {
    intro: introMatch?.[1] || "",
    meaning: meaningMatch?.[1] || "",
    pronunciation: pronunciationMatch?.[1] || "",
    message: messageMatch?.[1] || "",
    nicknames: nicknamesMatch?.[1] || "_None_"
  }
  console.log(parts)
  cleanText(parts)
  console.log(parts)
  return parts
}

const cleanText = (parts) => {
  parts.meaning = parts.meaning.replace(/\*\*/g, '');
  parts.pronunciation = parts.pronunciation.replace(/\*\*/g, '');
  parts.message = parts.message.replace(/\*\*/g, '');
  parts.nicknames = parts.nicknames.replace(/\*\*/g, '');
  console.log(parts)
  return parts
}


const saveToFirestore = async (name, response) => {
  try{
    await addDoc(collection(db, "names"), {
      name: name,
      response: response,
      timestamp: Timestamp.now()
    });
    console.log("saved to firestore");
  } catch(error){
    console.error("Error saving to firestore: " + error)
  }
}

const downloadImage = async () => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `${name}_meaning.png`
  link.click();
}

const shareImage = async () => {
  try{
    const response = await fetch(imageUrl);
    const blob = await response.blob()
    const file = new File([blob], `${name}_meaning.png`, {type: "image/png"});

    if(navigator.canShare && navigator.canShare({ files: [file]})){
      await navigator.share({
        files: [file],
        title: `name meaning for ${name}`,
        text: `Check out the meaning of "${name}" 💫`,
      })
    }else{
      alert("Sharing not supoorted on this device");
    }
  }catch (error) {
    console.error("Share failed:", error)
    alert("something went wrong while sharing")
  }
}
  
  return (
    <>
    <div className='page-wrapper'>
    <NavBar />
    <div className="container">
      {!partsOfResponse && <div className='main-heading'><h1>What’s in a name?<br /> </h1><p>Your whole vibe</p></div>}
      {loading ? <p>Loading...</p> : 
      <div className='output-container'>
      {partsOfResponse && 
      <div id="sharable" className="output">
        <div className='output-name-intro'>
        <ReactMarkdown>{partsOfResponse.intro}</ReactMarkdown>
        </div>
        <div id="sharable-image" className='output-name-image' style={{backgroundColor: bgColor}}>
        <h1 className='output-name-heading'>{name}</h1>
        <div className='output-name-pronunciation'><ReactMarkdown>{partsOfResponse.pronunciation}</ReactMarkdown></div>
        <div className='output-name-meaning'>
        <ReactMarkdown>{partsOfResponse.meaning}</ReactMarkdown>
        </div>
        </div>
      {
        imageUrl && (
          <div className='output-buttons'>
          <button onClick={downloadImage}><MdOutlineFileDownload /></button>
          <button onClick={shareImage}><IoShareSocial /></button>
          </div>
        )
      }
        <div className='output-name-message'>
        <ReactMarkdown>{partsOfResponse.message}</ReactMarkdown>
        </div>
        <div className='output-name-nicknames'>
        <ReactMarkdown>{partsOfResponse.nicknames}</ReactMarkdown>
        </div>
        </div>} 
      </div>
  	  }
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={(e) => {setName(e.target.value)}} value={name} placeholder='Enter your name...'/>
        <button className='submit'><FaArrowRight /></button>
      </form>
    </div>
      </div>
    </>
  )
}

export default App