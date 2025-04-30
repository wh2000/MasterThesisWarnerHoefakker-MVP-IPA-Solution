import React, { useContext, useState } from "react";
import "./commentbar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

const Commentbar = () => {
    const { extended, setExtended } = useContext(Context);
    const { span, setSpan } = useContext(Context);
    const { resultPrompt } = useContext(Context);
	const { backgroundColor, setBackgroundColor } = useContext(Context);
	const { borderColor, setBorderColor } = useContext(Context);

    const [category, setCategory] = useState("");
    const [clickedDivIndex, setClickedDivIndex] = useState(null);

    const comments = resultPrompt.comments;

    const handleAll = () => {
        setCategory("all");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handleM = () => {
        setCategory("mindset");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handleCB = () => {
        setCategory("sentiment");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handlePT = () => {
        setCategory("unsaid");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handleP = () => {
        setCategory("language bias");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handleW = () => {
        setCategory("personality");
		setSpan("");
		setClickedDivIndex(-1);
    };

    const handleZ = () => {
        setCategory("cognitive bias");
		setSpan("");
		setClickedDivIndex(-1);
    };

	const handleSpan = (spanValue, backgroundColor, borderColor) => {
        setSpan(spanValue);
		setBackgroundColor(backgroundColor);
		setBorderColor(borderColor)
    };

    const handleClick = (index, commentSpan, backgroundColor, borderColor) => {
        setClickedDivIndex(index);
        handleSpan(commentSpan, backgroundColor, borderColor);
    };

    return (
        <div className={`commentbar ${extended ? "extended" : ""}`}>
            {extended ? (
                <div className="extended-content">
                    <div className="commentbar-body">
                        <div className="commentbar-menu">
                            <ul>
                                <li style={{ borderBottom: '0.2rem solid #21130d' }}>
                                    <a onClick={handleAll}>All</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #f5526f' }}>
                                    <a onClick={handleM}>Mindset</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #2ebfaf' }}>
                                    <a onClick={handleCB}>Sentiment</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #20bdd8' }}>
                                    <a onClick={handlePT}>Unsaid</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #ecbb1f' }}>
                                    <a onClick={handleP}>Language Bias</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #6c25be' }}>
                                    <a onClick={handleW}>Personality Traits</a>
                                </li>
                                <li style={{ borderBottom: '0.2rem solid #Ff1986' }}>
                                    <a onClick={handleZ}>Cognitive Bias</a>
                                </li>
                            </ul>
                        </div>
                        <div className="commentbar-content">
                        {category === "" && (
                            category === "" ? (
                                <p className="no-category-message">Select a category to view its comments.</p>
                            ) : (
                                <p className="no-category-message">Select a category to view its comments.</p>
                            )
                            )}
                            {comments
                                .filter(() =>
                                    category === "all"
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#e9e7e7" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #21130d" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "#e9e7e7", "#21130d")}
                                    >
                                        <p><b>Type:</b> {comment.attribute.toLowerCase()}</p>
                                            {!comment.value.attribute && comment.value !== 1 && (
                                                <p><b>Value: </b>{comment.value.toLowerCase()}</p>
                                            )}
                                            {comment.value.attribute && (
                                                <p><b>Type {comment.attribute.toLowerCase()}: </b>{comment.value.attribute.toLowerCase()}</p>
                                            )}
                                            {comment.value.value && (
                                                <p><b>Value: </b>{comment.value.value}</p>
                                            )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
                            {comments
                                .filter((comment) =>
                                    category === "mindset" && comment.attribute.toLowerCase().includes("mindset")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#ffcccb" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #DC143C" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "#ffcccb", "#DC143C")}
                                    >
                                        <p><b>Type:</b> mindset</p>
                                        {comment.value !== 1 && (
                                            <p><b>Mindset type: </b>{comment.value.attribute.toLowerCase()}</p>
                                        )}
                                    
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.value}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}

                            {comments
                                .filter((comment) =>
                                    category === "sentiment" && comment.attribute.toLowerCase().includes("sentiment")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#d1ffbd" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #00c04b" : "1px solid #a4a4a4",
										}}
                                        onClick={() => handleClick(index, comment.span, "#d1ffbd", "#00c04b")}
                                    >
                                        <p><b>Type:</b> sentiment</p>
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.toLowerCase()}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
                            {comments
                                .filter((comment) =>
                                    category === "unsaid" && comment.attribute.toLowerCase().includes("unsaid")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "lightblue" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #2596be" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "lightblue", "#2596be")}
                                    >
                                        <p><b>Type:</b> unsaid</p>
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.toLowerCase()}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
							{comments
                                .filter((comment) =>
                                    category === "language bias" && comment.attribute.toLowerCase().includes("language bias")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#fffdaf" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #FDDA0D" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "#fffdaf", "#FDDA0D")}
                                    >
                                        <p><b>Type:</b> language bias</p>
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.toLowerCase()}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
                            {comments
                                .filter((comment) =>
                                    category === "cognitive bias" && comment.attribute.toLowerCase().includes("cognitive bias")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#ffd1e7" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #Ff1986" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "#ffd1e7", "#Ff1986")}
                                    >
                                        <p><b>Type:</b> cognitive bias</p>
                                        {comment.value !== 1 && (
                                            <p><b>Bias type: </b> {comment.value.attribute.toLowerCase()}</p>
                                        )}
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.value}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
                            {comments
                                .filter((comment) =>
                                    category === "personality" && comment.attribute.toLowerCase().includes("personality")
                                )
                                .map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="category"
                                        style={{
                                            backgroundColor: clickedDivIndex === index ? "#d3beec" : "#f0f0f0",
                                            cursor: "pointer",
											border: clickedDivIndex === index ? "3px solid #6c25be" : "1px solid #a4a4a4",
                                        }}
                                        onClick={() => handleClick(index, comment.span, "#d3beec", "#6c25be")}
                                    >
                                        <p><b>Type:</b> personality traits</p>
                                        {comment.value !== 1 && (
                                            <p><b>Traits type: </b> {comment.value.attribute.toLowerCase()}</p>
                                        )}
                                        {comment.value !== 1 && (
                                            <p><b>Value: </b> {comment.value.value}</p>
                                        )}
                                        <p><b>Explanation:</b> {comment.explanation.toLowerCase()}</p>
                                        <p><b>Confidence:</b> {comment.confidence}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Commentbar;
