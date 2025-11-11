import React from "react";
import "./loginForm.css";
import { useNavigate } from "react-router-dom";

export default function loginForm(props) {
  const navigate = useNavigate();
  const activeTab = props.activeTab;
  const message = activeTab === "aluno" ? "Olá aluno," : "Olá professor,";

  const [name, setName] = React.useState("");

  function handleSubmit() {
    if (activeTab === "aluno") {
      navigate("/student-form", { state: { name: name } });
    } else {
      navigate("/teacher-form", { state: { name: name } });
    }
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <p> {message} realize sua autenticação para acessar ao nosso serviço. </p>

      <div className="form-group">
        <label htmlFor="Nome">Nome:</label>
        <input
          type="text"
          id="password"
          placeholder="Seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="registration">
          {" "}
          {activeTab === "aluno" ? "Matrícula" : "E-mail"}{" "}
        </label>
        <input
          type="text"
          id="password"
          placeholder={
            activeTab === "aluno" ? "1-0000000000" : "email@email.com"
          }
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <input type="password" id="password" placeholder="********" />
      </div>

      <button type="submit">Entrar</button>
    </form>
  );
}
