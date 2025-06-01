import React, { useEffect, useState } from "react";
import { db } from "./services/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import html2canvas from "html2canvas";
import generateMeaning from "./services/ai";
import NavBar from "./common/NavBar";
import "./App.css";
import { FaArrowRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import PronounceButton from "./services/PronounceButton";
import { BiCopy } from "react-icons/bi";
import { FaCheck } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { Toaster } from 'react-hot-toast';
import toast from "react-hot-toast";

const App = () => {
  const [name, setName] = useState("");
  const [generatedName, setGeneratedName] = useState("");
  const [data, setData] = useState(null);
  const [partsOfResponse, setPartsOfResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [currentDocId, setCurrentDocId] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let uid = localStorage.getItem("user_id");

    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem("user_id", uid);
    }
  }, []);

  useEffect(() => {
    const generateImage = async () => {
      const element = document.getElementById("sharable-image");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 3,
        ignoreElements: (element) => {
          return element.classList?.contains("no-screenshot");
        },
      });

      const image = canvas.toDataURL("image/png");
      setImageUrl(image);
    };

    if (partsOfResponse) {
      generateImage();
    }
  }, [partsOfResponse]);

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
    e.preventDefault();
    if (!name.trim() || name === "") {
      alert("Please Enter a name to contiue.");
      return;
    }

    // capitalize the name
    const capitalizedName = capitalizeName(name);

    // save the name
    setGeneratedName(capitalizedName);

    //pick a random pastel color
    const randomColor =
      pastelColors[Math.floor(Math.random() * pastelColors.length)];
    setBgColor(randomColor);

    setLoading(true);
    try{
    const response = await generateMeaning(name);
    setData(response?.text);
    setPartsOfResponse(makePartsOfResponse(response?.text));
    setLoading(false);

    // Toasst to share
    const hasSeenShareToast = localStorage.getItem("has_seen_share_toast")

    if(!hasSeenShareToast){
      setTimeout(() => {
        toast("That was cool, right? Show it off to your squad — let them give it a shot too!", {
          duration: "1000",
          position: "bottom",
          icon: "😎",
          
        })
      }, 10000)
      localStorage.setItem("has_seen_share_toast", "true")
    }

    const docId = await saveToFirestore(name, response?.text);
    setCurrentDocId(docId.id);
    setLiked(false);
    }catch(error){
      toast.error('Whoa, too many vibes at once! The engine\'s catching its breath. Try again in a few seconds!!');
      setLoading(false)
    }
    // await saveToFirestore(name, response.text);
  };

  const capitalizeName = (nameToBeCaptalized) => {
    if (!nameToBeCaptalized) return "";
    return (
      nameToBeCaptalized.charAt(0).toUpperCase() +
      nameToBeCaptalized.slice(1).toLowerCase()
    );
  };

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
      nicknames: nicknamesMatch?.[1] || "_None_",
    };
    cleanText(parts);
    return parts;
  };

  const cleanText = (parts) => {
    parts.meaning = parts.meaning.replace(/\*\*/g, "");
    parts.pronunciation = parts.pronunciation.replace(/\*\*/g, "");
    parts.message = parts.message.replace(/\*\*/g, "");
    parts.nicknames = parts.nicknames.replace(/\*\*/g, "");
    return parts;
  };

  const saveToFirestore = async (name, response) => {
    const user_id = localStorage.getItem("user_id");

    try {
      // save
      const docRef = await addDoc(collection(db, "users", user_id, "names"), {
        user_id: user_id,
        name: name,
        response: response,
        liked: false,
        timestamp: Timestamp.now(),
      });

      return docRef;
    } catch (error) {
      console.error("Error saving to firestore: " + error);
    }
  };

  const downloadImage = async () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${generatedName}_meaning.png`;
    link.click();
  };

  const shareImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${generatedName}_meaning.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `name meaning for ${generatedName}`,
          text: `Check out the meaning of "${generatedName}" 💫`,
        });
      } else {
        toast.error("Sharing not supoorted on this device")
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleLike = async () => {
    if (!currentDocId) return;

    const user_id = localStorage.getItem("user_id");
    const docRef = doc(db, "users", user_id, "names", currentDocId);
    const newLikeStatus = !liked;

    try {
      await updateDoc(docRef, { liked: newLikeStatus });
      setLiked(newLikeStatus);
    } catch (err) {
      console.error("Error updating like status: ", err);
    }
  };

  const LikeButton = () => {
    return (
      <button onClick={handleLike} className="copy-button">
        {liked ? <FaHeart /> : <FaRegHeart />}
      </button>
    );
  };

  const CopyButton = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      if (!partsOfResponse) return;

      const textToCopy = [
        `Name: ${generatedName}`,
        `Pronunciation: ${partsOfResponse.pronunciation}`,
        `Meaning: ${partsOfResponse.meaning}`,
        `Message: ${partsOfResponse.message}`,
        `Nicknames: ${partsOfResponse.nicknames}`,
      ].join("\n\n");

      navigator.clipboard
        .writeText(textToCopy.trim())
        .then(() => {
          //toast copied to clipboard
          setCopied(true);

          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    };

    return (
      <button onClick={handleCopy} className="copy-button">
        {copied ? <FaCheck /> : <BiCopy />}
      </button>
    );
  };

  return (
      <div className="container">
      <NavBar />
        {loading ||
          (!partsOfResponse && (
            <div className="main-heading">
              <h1>
                What’s in a name?
                <br />{" "}
              </h1>
              <p>Your whole vibe</p>
            </div>
          ))}
        {loading ? (
          <p className="loader">
            <ClipLoader color={"#ffffff"} loading={loading} size={50} />
          </p>
        ) : (
          <div className="output-container">
            {partsOfResponse && (
              <div id="sharable" className="output">
                <div className="output-name-intro">
                  <ReactMarkdown>{partsOfResponse.intro}</ReactMarkdown>
                </div>
                <div
                  id="sharable-image"
                  className="output-name-image"
                  style={{ backgroundColor: bgColor }}
                >
                  <h1 className="output-name-heading">
                    {generatedName}
                    <span className="no-screenshot">
                      <PronounceButton text={generatedName} />
                    </span>
                  </h1>
                  <div className="output-name-pronunciation">
                    <ReactMarkdown>
                      {partsOfResponse.pronunciation}
                    </ReactMarkdown>
                  </div>
                  <div className="output-name-meaning">
                    <ReactMarkdown>{partsOfResponse.meaning}</ReactMarkdown>
                  </div>
                </div>
                {imageUrl && (
                  <div className="output-buttons">
                    <button onClick={downloadImage}>
                      <MdOutlineFileDownload />
                    </button>
                    <button onClick={shareImage}>
                      <IoShareSocial />
                    </button>
                  </div>
                )}
                <div className="output-name-message">
                  <ReactMarkdown>{partsOfResponse.message}</ReactMarkdown>
                </div>
                <div className="output-name-nicknames">
                  <p>Thoughtfully chosen pet names that echo your essence: </p>
                  <div className="nicknames">
                    <ReactMarkdown>{partsOfResponse.nicknames}</ReactMarkdown>
                  </div>
                </div>
                <div className="like-and-copy-buttons">
                  <LikeButton />
                  <CopyButton />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="form-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
            placeholder="Enter your name..."
            />
          <button
            className="submit"
            type="submit"
            disabled={loading || !name.trim()}
            >
            <FaArrowRight />
          </button>
        </form>
      <div className="app-footer-note no-screenshot">
        Melwyn made me so you could flex your name meaning. Made for fun.
        Powered by Gemini.
      </div>
      </div>
       <Toaster position="top-center" reverseOrder={false} />
      </div>
  );
};

export default App;
