import { useState } from "react";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { HiMiniSpeakerXMark } from "react-icons/hi2";


const PronounceButton = ({text}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const speak = (text) => {
        if(speechSynthesis.speaking){
            speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';


        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)

        speechSynthesis.speak(utterance);
    }
    return(
    <button className="speaker-button" onClick={() => speak(text)}>{isSpeaking ? <HiMiniSpeakerXMark /> : <HiMiniSpeakerWave />}</button>
    )
}

export default PronounceButton;