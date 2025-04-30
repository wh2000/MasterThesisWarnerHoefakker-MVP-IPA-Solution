import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context"; // Ensure correct import
import FileUploadModal from "../fileuploadmodal/fileuploadmodal";
import axios from "axios";

const AUTH_QUESTIONS = [
  "Is there a documented authentication policy that defines requirements for passwords, multifactor authentication, and other verification methods?",
  "Does the policy address authentication requirements for both remote and local users?",
  "Are minimum password complexity, expiration, and lockout settings clearly specified in the policy?",
  "Is there evidence that password controls and authentication methods are consistently enforced?",
  "Is MFA mandated for critical systems, and is its application consistently verified?",
  "Are modern authentication mechanisms (e.g., tokens, biometrics) incorporated and kept up-to-date?",
  "Are authentication logs maintained and regularly reviewed for both successful and failed attempts?",
  "Is there a defined process to investigate and remediate anomalous authentication events?",
  "Are employees regularly trained on secure authentication practices, with evidence of training sessions and acknowledgments?",
  "Are authentication controls periodically reviewed to ensure they remain effective against evolving threats?"
];

const CHANGE_QUESTIONS = [
  "Is there a formal, documented change management policy outlining the entire lifecycle of changes?",
  "Are all change requests logged, reviewed, and approved before implementation?",
  "Does the process include a risk assessment to evaluate the potential impact of each change?",
  "Is there a clear segregation of duties between those requesting, approving, and implementing changes?",
  "Are emergency changes subject to a defined retrospective review process?",
  "Are changes thoroughly tested in a controlled environment before production deployment?",
  "Are documented rollback procedures in place and included as part of the change process?",
  "Is there a post-implementation review to confirm that changes meet their intended objectives without introducing new risks?",
  "Are comprehensive audit trails maintained to track who initiated, approved, and executed each change?",
  "Is there an ongoing process to monitor change activities and investigate unauthorized or unusual events?"
];

const Main = () => {
  const {
    recentPrompt,
    showResults,
    setShowResults,
    setInput,
    input,
    resultData,
    setResultData,
    span,
    backgroundColor,
    borderColor,
    loading,
    setLoading,
  } = useContext(Context); // Using useContext to access values

  const [showModal, setShowModal] = useState(false); // Modal state
  const [files, setFiles] = useState({ evidence: null, policy: null }); // Files state

  // New state variables for subject and question selection
  const [subjectChoice, setSubjectChoice] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [questionChoice, setQuestionChoice] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [fileNames, setFileNames] = useState(""); // State to hold the file names

  // Function to handle sending the files, subject, and question to the backend
  const handleSend = async () => {
    // Determine final subject and question based on selections
    const finalSubject = subjectChoice === "Custom" ? customSubject : subjectChoice;
    let finalQuestion = "";
    if (subjectChoice === "Authentication" || subjectChoice === "Change Management") {
      finalQuestion = questionChoice === "Custom" ? customQuestion : questionChoice;
    } else {
      finalQuestion = customQuestion;
    }

    if (!files.evidence || !files.policy || !finalSubject) {
      alert("Please upload both files and enter a subject.");
      return;
    }

    setShowResults(true);
    setLoading(true);
    setInput(" ");
    setSubjectChoice("");
    setCustomSubject("");
    setQuestionChoice("");
    setCustomQuestion("");
    setFileNames("");

    const formData = new FormData();
    formData.append("evidence", files.evidence);
    formData.append("policy", files.policy);
    formData.append("subject", finalSubject);
    formData.append("question", finalQuestion);

    try {
      const response = await axios.post("http://localhost:4000/api/v1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResultData(response.data[0]);
      setInput(" ");
      setLoading(false);
      setFiles({ evidence: null, policy: null });
    } catch (error) {
      setLoading(false);
      console.error("Error uploading data:", error);
      alert("Error uploading data.");
    }
  };

  const handleFileChange = (newFiles) => {
    setFiles(newFiles);

    // Collect file names dynamically
    const fileNamesArray = [];
    if (newFiles.evidence?.name) fileNamesArray.push(newFiles.evidence.name);
    if (newFiles.policy?.name) fileNamesArray.push(newFiles.policy.name);

    // Generate a string with the names of the files, joined by " & "
    const fileNamesString =
      fileNamesArray.length > 0
        ? `Files uploaded: ${fileNamesArray.join(" & ")}`
        : "No files uploaded";

    setFileNames(fileNamesString);
  };

  const formatText = (text) => {
    return text
      .replace(/1\. Summary of Findings/g, '<h2 class="section-header">Summary of Findings</h2>')
      .replace(/📋 Conclusion:/g, '<h3 class="conclusion">Conclusion:</h3>')
      .replace(/2\. Matches & Mismatches/g, '<h2 class="section-header">Matches & Mismatches</h2>')
      .replace(/✅ Matches:/g, '<h3 class="matches">Matches:</h3>')
      .replace(/❌ Mismatches:/g, '<h3 class="mismatches">Mismatches:</h3>')
      .replace(/3\. Missing Controls/g, '<h2 class="section-header">Identified control gaps</h2>')
      .replace(/Identification of gaps/g, '')
      .replace(/partially effective./g, '<strong>partially effective.</strong>')
      .replace(/effective\./g, '<strong>effective.</strong>')
      .replace(/non-effective\./g, '<strong>non-effective.</strong>')
      .replace(/3. Additional Observations/g, '')
      .replace(/4. Recommendations/g, '')
      .replace(/- Policy:/g, '<strong class="policy">- Policy:</strong>')
      .replace(/- Policy/g, '<strong class="policy">- Policy</strong>')
      .replace(/- Evidence/g, '<strong class="policy">- Evidence</strong>')
      .replace(/- Evidence:/g, '<strong class="evidence">- Evidence:</strong>')
      .replace(/- ➡/g, '<strong class="evidence">- Conclusion:</strong>')
      .replace(/^- (.*?)(?=<|$)/gm, '<br><strong>$1</strong>')
      .replace(/###/g, '') 
      .replace(/➡ (.*?)(?=<)/g, '<span class="analysis">➡ $1</span>');
  };

  return (
    <div className="main">
      <div className="nav">
        <img src={assets.kpmg} className="kpmg" alt="" />
      </div>
      <div className="main-container">
      {!showResults ? (
          <div className="greet">
            <p>
              <span>Intelligent Audit Automation</span>
            </p>
            <p>What policies and evidence may I analyze for you today?</p>
          </div>
        ) : (
          <div className="result">
            <div className="result-data">
              <img src={assets.user} alt="" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <>
                  <div className="audit-container">
                    <p dangerouslySetInnerHTML={{ __html: formatText(resultData["Result"] || "No results available") }} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}


        <div className="main-bottom">
          {fileNames && (
            <div className="file-names-box">
              <p>{fileNames}</p>
            </div>
          )}

          <div className="search-box">
            <img src={assets.attachment} alt="" onClick={() => setShowModal(true)} />

            {/* Subject Section - Dropdown replaced by input when Custom */}
            <div className="subject-section">
              {subjectChoice !== "Custom" ? (
                <select
                  value={subjectChoice}
                  onChange={(e) => {
                    setSubjectChoice(e.target.value);
                    setQuestionChoice("");
                    setCustomQuestion("");
                  }}
                  className="subject-select"
                >
                  <option value="">Select subject</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Change Management">Change management</option>
                  <option value="Custom">Custom</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter custom subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="subject-input"
                />
              )}
            </div>

            {/* Question Section - Dynamic display based on selections */}
            <div className="question-section">
              {subjectChoice === "Custom" ? (
                <input
                  type="text"
                  placeholder="Enter custom question"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="question-input"
                />
              ) : (
                <>
                  {(subjectChoice === "Authentication" || subjectChoice === "Change Management") && (
                    <>
                      {questionChoice !== "Custom" ? (
                        <select
                          value={questionChoice}
                          onChange={(e) => {
                            setQuestionChoice(e.target.value);
                            if (e.target.value !== "Custom") setCustomQuestion("");
                          }}
                          className="question-select"
                        >
                          <option value="">Select Question</option>
                          {(subjectChoice === "Authentication"
                            ? AUTH_QUESTIONS
                            : CHANGE_QUESTIONS
                          ).map((q, index) => (
                            <option key={index} value={q}>{q}</option>
                          ))}
                          <option value="Custom">Custom</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Enter custom question"
                          value={customQuestion}
                          onChange={(e) => setCustomQuestion(e.target.value)}
                          className="question-input"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="send-icon-container">
              <img src={assets.send_icon} alt="" onClick={handleSend} />
            </div>
          </div>
          
          <div className="bottom-info">
            <p>"Intelligent Audit Automation" may display inaccurate info...</p>
          </div>
        </div>
      </div>
      <FileUploadModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        setFiles={handleFileChange}
      />
    </div>
  );
};

export default Main;
  
// import { useContext, useState } from "react";
// import { assets } from "../../assets/assets";
// import "./main.css";
// import { Context } from "../../context/Context"; // Ensure correct import
// import FileUploadModal from "../fileuploadmodal/fileuploadmodal";
// import axios from "axios";

// const Main = () => {
//   const {
//     recentPrompt,
//     showResults,
//     setShowResults,
//     setInput,
//     input,
//     resultData,
//     setResultData,
//     span,
//     backgroundColor,
//     borderColor,
//     loading,
//     setLoading,
//   } = useContext(Context); // Using useContext to access values

//   const [showModal, setShowModal] = useState(false); // Modal state
//   const [files, setFiles] = useState({ evidence: null, policy: null }); // Files state
//   const [subject, setSubject] = useState(""); // Subject state
//   const [question, setQuestion] = useState(""); // Question state
//   const [fileNames, setFileNames] = useState(""); // State to hold the file names

//   // Function to handle sending the files, subject, and question to the backend
//   const handleSend = async () => {
//     if (!files.evidence || !files.policy || !subject) {
//       alert("Please upload both files and enter a subject.");
//       return;
//     }

//     setShowResults(true); 
//     setLoading(true);
//     setInput(" ");
//     setSubject("");
//     setQuestion("");
//     setFileNames("");

//     const formData = new FormData();
//     formData.append("evidence", files.evidence);
//     formData.append("policy", files.policy);
//     formData.append("subject", subject);
//     formData.append("question", question);

//     try {
//       const response = await axios.post("http://localhost:4000/api/v1/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setResultData(response.data[0]);
//       setInput(" ");
//       setSubject("");
//       setQuestion("");
//       setLoading(false);
//       setFiles({ evidence: null, policy: null });

//     } catch (error) {
//       setLoading(false);
//       console.error("Error uploading data:", error);
//       alert("Error uploading data.");
//     }
//   };

//   const handleFileChange = (newFiles) => {
//     setFiles(newFiles);

//     // Collect file names dynamically
//     const fileNamesArray = [];
//     if (newFiles.evidence?.name) fileNamesArray.push(newFiles.evidence.name);
//     if (newFiles.policy?.name) fileNamesArray.push(newFiles.policy.name);

//     // Generate a string with the names of the files, joined by " & "
//     const fileNamesString = fileNamesArray.length > 0 
//       ? `Files uploaded: ${fileNamesArray.join(' & ')}`
//       : 'No files uploaded';

//     setFileNames(fileNamesString);
//   };

//   const formatText = (text) => {
//     return text
//       .replace(/1\. Summary of Findings/g, '<h2 class="section-header">Summary of Findings</h2>')
//       .replace(/Conclusion:/g, '<h3 class="conclusion">📋 Conclusion:</h3>')
//       .replace(/2\. Matches & Mismatches/g, '<h2 class="section-header">Matches & Mismatches</h2>')
//       .replace(/✅ Matches:/g, '<h3 class="matches">Matches:</h3>')
//       .replace(/❌ Mismatches:/g, '<h3 class="mismatches">Mismatches:</h3>')
//       .replace(/3\. Missing Controls/g, '<h2 class="section-header">Identified control gaps</h2>')
//       .replace(/- Policy:/g, '<strong class="policy">- Policy:</strong>')
//       .replace(/- Policy/g, '<strong class="policy">- Policy</strong>')
//       .replace(/- Evidence/g, '<strong class="policy">- Evidence</strong>')
//       .replace(/- Evidence:/g, '<strong class="evidence">- Evidence:</strong>')
//       .replace(/- ➡/g, '<strong class="evidence">- Conclusion:</strong>')
//       .replace(/^- (.*?)(?=<|$)/gm, '<br><strong>$1</strong>')
//       .replace(/###/g, '') 
//       .replace(/➡ (.*?)(?=<)/g, '<span class="analysis">➡ $1</span>');
//   };

//   return (
//     <div className="main">
//       <div className="nav">
//         <img src={assets.kpmg} className="kpmg" alt="" />
//       </div>
//       <div className="main-container">
//         {!showResults ? (
//           <div className="greet">
//             <p>
//               <span>Intelligent Audit Automation</span>
//             </p>
//             <p>What policies and evidence may I analyze for you today?</p>
//           </div>
//         ) : (
//           <div className="result">
//             <div className="result-data">
//               <img src={assets.user} alt="" />
//               {loading ? (
//                 <div className="loader">
//                   <hr />
//                   <hr />
//                   <hr />
//                 </div>
//               ) : (
//                 <>
// 				          {/* <div>
//                     <p>{resultData["Result"]?.replace(/#/g, "") || "No results available"}</p>
//                   </div> */}

//                   <div className="audit-container">
//                     <p dangerouslySetInnerHTML={{ __html: formatText(resultData["Result"] || "No results available") }} />
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="main-bottom">
//           {/* Display the file names box above the search box */}
//           {fileNames && (
//             <div className="file-names-box">
//               <p>{fileNames}</p>
//             </div>
//           )}
          
//           <div className="search-box">
//             <img
//               src={assets.attachment}
//               alt=""
//               onClick={() => setShowModal(true)}
//             />
//             <input
//               onChange={(e) => setSubject(e.target.value)}
//               value={subject}
//               type="text"
//               placeholder="Enter the subject"
// 			  className="subject-input"
//             />

// 			<div className="divider-line"></div>

//             <input
//               onChange={(e) => setQuestion(e.target.value)}
//               value={question}
//               type="text"
//               placeholder="Enter the (optional) specific question here"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleSend();
//               }}
// 			  className="question-input"
//             />
//             <div>
//               <img src={assets.send_icon} alt="" onClick={handleSend} />
//             </div>
//           </div>
//           <div className="bottom-info">
//             <p>
//               "Intelligent Audit Automation" may display inaccurate info so
//               double-check its responses.
//             </p>
//           </div>
//         </div>
//       </div>
//       <FileUploadModal
//         showModal={showModal}
//         handleClose={() => setShowModal(false)}
//         setFiles={handleFileChange} // Pass the function to handle file updates
//       />
//     </div>
//   );
// };

// export default Main;
