import { createContext, useState } from "react";
import runChat from "../config/Gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResults, setShowResults] = useState(false);  // Show results state
  const [loading, setLoading] = useState(false);  // Loading state
  const [resultData, setResultData] = useState("");
  const [extended, setExtended] = useState(false);
  const [span, setSpan] = useState([]);
  const [resultPrompt, setResultPrompt] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [borderColor, setBorderColor] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 10 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResults(false);
    setExtended(false);
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResults(true);  // Show results when data is sent
    let response;
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await runChat(input);
    }

    try {
      setResultPrompt(response);
      const resultPrompt = response.prompt.prompt;
      let responseArray = resultPrompt.split("**");
      let newResponse = "";
      for (let i = 0; i < responseArray.length; i++) {
        if (i === 0 || i % 2 !== 1) {
          newResponse += responseArray[i];
        } else {
          newResponse += "<b>" + responseArray[i] + "</b>";
        }
      }
      let newResponse2 = newResponse.split("*").join("<br/>");
      let newResponseArray = newResponse2.split("");
      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        delayPara(i, nextWord + "");
      }
    } catch (error) {
      console.error("Error while running chat:", error);
    } finally {
      setExtended(true);
      setLoading(false);  // Set loading to false when finished
      setInput("");
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    input,
    setInput,
    showResults,  // This is being passed to the context
    setShowResults,  // This is being passed to the context
    loading,  // This is being passed to the context
    setLoading,  // This is being passed to the context
    resultData,
    newChat,
    extended,
    setExtended,
    setSpan,
    resultPrompt,
    setResultData,
    span,
    setBackgroundColor,
    backgroundColor,
    setBorderColor,
    borderColor,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
