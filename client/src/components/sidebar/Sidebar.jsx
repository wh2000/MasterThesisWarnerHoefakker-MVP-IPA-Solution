import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useState } from "react";
import { Context } from "../../context/Context";
import * as React from 'react';

const Sidebar = () => {
	const [extended, setExtended] = useState(false);
	const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);
	const [state, setState] = React.useState({
		gemini: true,
		chatgpt: false,
	  });
	
	// Load state from sessionStorage on component mount
	React.useEffect(() => {
		const savedState = sessionStorage.getItem('LLM');
		if (savedState) {
		setState(JSON.parse(savedState));
		}
	}, []);

	// Update sessionStorage whenever state changes
	React.useEffect(() => {
		sessionStorage.setItem('LLM', JSON.stringify(state));
	}, [state]);

	const handleChange = (event) => {
		const { name, checked } = event.target;
		setState({
		  ...state,
		  [name]: checked,
		  [name === 'gemini' ? 'chatgpt' : 'gemini']: !checked,
		});
	};

	const loadPreviousPrompt = async (prompt) => {
		setRecentPrompt(prompt);
		await onSent(prompt);
	};

	return (
		<div className="sidebar">
			<div className="top">
				<img
					src={assets.menu_icon}
					className="menu"
					alt="menu-icon"
					onClick={() => {
						setExtended((prev) => !prev);
					}}
				/>
				<div className="new-chat">
					<img src={assets.plus_icon} alt="" onClick={()=>{
                        newChat()
                    }} />
					{extended ? <p>New Chat</p> : null}
				</div>
				{extended ? (
					<div className="recent">
						<p className="recent-title">Recent</p>
						{prevPrompts.map((item, index) => {
							return (
								<div onClick={()=>{
                                    loadPreviousPrompt(item)
                                }} className="recent-entry">
									<img src={assets.message_icon} alt="" />
									<p>{item.slice(0, 18)}...</p>
								</div>
							);
						})}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Sidebar;
