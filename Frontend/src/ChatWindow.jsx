import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners";
import { API_BASE_URL } from "./config.js";

function ChatWindow() {
    const {
        prompt, setPrompt,
        reply, setReply,
        currThreadId,
        setPrevChats,
        setNewChat,
        user, setUser,
        token, setToken,
        setAllThreads
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [authMode, setAuthMode] = useState(null);
    const [authForm, setAuthForm] = useState({name: "", email: "", password: ""});
    const [authError, setAuthError] = useState("");

    const getReply = async () => {
        if(!token) {
            setAuthMode("login");
            return;
        }

        if(!prompt.trim()) return;

        setLoading(true);
        setNewChat(false);

        console.log("message ", prompt, " threadId ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            const res = await response.json();
            console.log(res);

            if(!response.ok) {
                alert(res.error || "Please login again");
                setLoading(false);
                return;
            }

            setReply(res.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    //Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const handleAuthChange = (e) => {
        setAuthForm({
            ...authForm,
            [e.target.name]: e.target.value
        });
    }

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");

        const url = authMode === "register" ? "/api/auth/register" : "/api/auth/login";

        const body = authMode === "register" ? authForm : {
            email: authForm.email,
            password: authForm.password
        };

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if(!response.ok) {
                setAuthError(data.error || "Something went wrong");
                return;
            }

            // Save login data so user stays logged in after page refresh
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setToken(data.token);
            setUser(data.user);
            setAuthMode(null);
            setIsOpen(false);
            setAuthForm({name: "", email: "", password: ""});
        } catch(err) {
            console.log(err);
            setAuthError("Unable to connect to server");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
        setPrevChats([]);
        setAllThreads([]);
        setNewChat(true);
        setReply(null);
        setIsOpen(false);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>ShubhamGPT <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen &&
                <div className="dropDown">
                    {
                        user ? (
                            <>
                                <div className="dropDownItem"><i className="fa-solid fa-user"></i> {user.name}</div>
                                <div className="dropDownItem"><i className="fa-solid fa-envelope"></i> {user.email}</div>
                                <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                            </>
                        ) : (
                            <>
                                <div className="dropDownItem" onClick={() => setAuthMode("login")}><i className="fa-solid fa-right-to-bracket"></i> Login</div>
                                <div className="dropDownItem" onClick={() => setAuthMode("register")}><i className="fa-solid fa-user-plus"></i> Register</div>
                            </>
                        )
                    }
                </div>
            }

            {
                authMode &&
                <div className="authOverlay">
                    <form className="authBox" onSubmit={handleAuthSubmit}>
                        <button className="authClose" type="button" onClick={() => setAuthMode(null)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <h2>{authMode === "register" ? "Create account" : "Login"}</h2>

                        {
                            authMode === "register" &&
                            <input
                                name="name"
                                placeholder="Name"
                                value={authForm.name}
                                onChange={handleAuthChange}
                            />
                        }

                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={authForm.email}
                            onChange={handleAuthChange}
                        />

                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={authForm.password}
                            onChange={handleAuthChange}
                        />

                        {authError && <p className="authError">{authError}</p>}

                        <button className="authSubmit" type="submit">
                            {authMode === "register" ? "Register" : "Login"}
                        </button>

                        <p className="authSwitch">
                            {authMode === "register" ? "Already have an account?" : "New here?"}
                            <span onClick={() => {
                                setAuthError("");
                                setAuthMode(authMode === "register" ? "login" : "register");
                            }}>
                                {authMode === "register" ? " Login" : " Register"}
                            </span>
                        </p>
                    </form>
                </div>
            }

            <Chat></Chat>

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder={token ? "Ask anything" : "Login to start chatting"}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    >

                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    ShubhamGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;
