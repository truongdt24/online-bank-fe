import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);

  const handleLogin = (token, cardNumber) => {
    setToken(token);
    setCardNumber(cardNumber);
  };
  const handleLogout = () => {
    setToken(null);
    setCardNumber(null);
  };

  return(
    <div>
      {token ? 
      <Dashboard token={token} cardNumber={cardNumber} onLogout={handleLogout}/> 
      : <Login onLogin={handleLogin} />}
    </div>
  );
}

export default App;
