import { React, useState } from "react";

import "./Home.css";
import LoginForm from "../../components/loginForm/loginForm.jsx";
import ResponsiveLogo from "../../components/responsiveLogo/responsiveLogo.jsx";

export default function Login() {
  const [activeTab, setActiveTab] = useState("aluno");

  function handleActiveTab(tab) {
    setActiveTab(tab);
  }
  
  return (
    <div className="content">
      <h1> UniCheck </h1>
      <div className="card">
        <h2> Seja Bem-Vindo! </h2>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "aluno" ? "active-tab" : ""}`}
            onClick={() => handleActiveTab("aluno")}
          >
            Aluno
          </button>
          <button
            className={`tab-button ${activeTab === "professor" ? "active-tab" : ""}`}
            onClick={() => handleActiveTab("professor")}
          >
            Professor
          </button>
        </div>
        <LoginForm activeTab={activeTab}/>
      </div>
      <ResponsiveLogo />
    </div>
  );
}
