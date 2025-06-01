import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
      apiKey: "AIzaSyA5WOlLVRvDyO7Y-mUOMUZW7kUlMMATGQQ",
    });

async function generateMeaning(name) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `You are an expert in names and their meanings.

Given a name, provide the following in a warm and friendly tone:
Start with a short, cool intro — something chill, clever, or aesthetic like.
1. A simple and heartfelt **meaning** of the name in one or two sentences.
2. A sweet and **uplifting message** based on that meaning to brighten someone's day.
3. Suggest 2–3 affectionate nicknames that aren’t directly derived from the name but reflect the person’s essence — inspired by their personality, emotional tone, or the meaning behind the name. Keep them rooted in Indian culture. Avoid joke-like or exaggerated names.

Use **Markdown** formatting for the output.

Format your response like this:

**Meaning:** <one or two sentences about the meaning>

**Pronunciation**: <The pronunciation of the name using the International Phonetic Alphabet (IPA), as shown in dictionaries (e.g., /ˈmɛl.wɪn/).>

**Message:** <a kind and uplifting sentence for the person with this name>

**Nicknames:** <comma-separated list of nicknames, or _None_ if not applicable>  

**Name:** \`${name}\`
`

  });
  return response;
}

export default generateMeaning

  