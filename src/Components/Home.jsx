import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle between login and register

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const endpoint = isRegisterMode ? "register" : "login";
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        if (!isRegisterMode) {
          localStorage.setItem('userName', data.username);
          localStorage.setItem('token', data.token); // Store JWT token
        }
        navigate(isRegisterMode ? "/login" : "/chat"); // Redirect to login after register, or chat after login
      } else {
        setError(data.error || "An unexpected error occurred.");
      }
    } catch (err) {
      console.error(`Error during ${endpoint}:`, err);
      setError("Unable to connect to the server.");
    }
  };

  return (
    <>


      <form onSubmit={handleSubmit} className="home__container">
      {error && <p className="text-danger">{error}</p>}
        <h2 className="home__header">{isRegisterMode ? "Register for Open Chat" : "Sign in to Open Chat"}</h2>
        <input
          type="text"
          minLength={6}
          name="username"
          id="username"
          placeholder="Username"
          className="username__input"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="username__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="home__cta" type="submit">
          {isRegisterMode ? "REGISTER" : "SIGN IN"}
        </button>

        <p>
          {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            className="toggle__mode"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? "Sign in" : "Register"}
          </button>
        </p>
      </form>
    </>
  );
};

export default Home;