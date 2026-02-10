import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login(){
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e){
    e.preventDefault();
    setError("");

    if(email === "123@gmail.com" && password === "1234"){
      localStorage.setItem("isLoggedIn", "true");
      navigate('/dashboard');
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="authPage">
      <form className="authForm" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p style={{ color: "#ff6b6b", fontSize: "0.9rem", margin: "0" }}>{error}</p>}
        <button type="submit" className="primaryBtn">Log in</button>
      </form>
    </div>
  )
}
