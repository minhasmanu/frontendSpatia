import { useNavigate } from "react-router-dom";
import "./Signup.css";

export default function Signup(){
  const navigate = useNavigate();

  function handleSubmit(e){
    e.preventDefault();
    // placeholder: integrate signup
    navigate('/dashboard');
  }

  return (
    <div className="authPage">
      <form className="authForm" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <label>
          Full name
          <input type="text" required />
        </label>
        <label>
          Email
          <input type="email" required />
        </label>
        <label>
          Password
          <input type="password" required />
        </label>
        <button type="submit" className="primaryBtn">Sign up</button>
      </form>
    </div>
  )
}
