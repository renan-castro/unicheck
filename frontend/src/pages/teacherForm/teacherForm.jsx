import { React, useEffect, useLayoutEffect, useState } from "react";
import "./teacherForm.css";
import { QRCodeCanvas } from "qrcode.react";
import ResponsiveLogo from "../../components/responsiveLogo/responsiveLogo.jsx";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function teacherForm() {
  // Recuperar dados do localStorage ao iniciar
  const getSavedData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [classId, setClassId] = useState(() => getSavedData("unicheck_classId", ""));
  const [timestamp, setTimestamp] = useState(Date.now());
  const [showQrCode, setShowQrCode] = useState(() => getSavedData("unicheck_showQrCode", false));
  const [subject, setSubject] = useState(() => getSavedData("unicheck_subject", ""));
  const [attendances, setAtendances] = useState(() => getSavedData("unicheck_attendances", []));
  const [qrValue, setQrValue] = useState(() => getSavedData("unicheck_qrValue", ""));

  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem("unicheck_classId", JSON.stringify(classId));
  }, [classId]);

  useEffect(() => {
    localStorage.setItem("unicheck_showQrCode", JSON.stringify(showQrCode));
  }, [showQrCode]);

  useEffect(() => {
    localStorage.setItem("unicheck_subject", JSON.stringify(subject));
  }, [subject]);

  useEffect(() => {
    localStorage.setItem("unicheck_attendances", JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem("unicheck_qrValue", JSON.stringify(qrValue));
  }, [qrValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!classId) return;
    const client = new Client({
      webSocketFactory: () =>
        new SockJS("https://unicheck.onrender.com/unicheck-websocket"),
      onConnect: () => {
        console.log("Conectado ao WebSocket");
        client.subscribe(`/topics/attendances/${classId}`, (msg) => {
          const p = JSON.parse(msg.body);
          if (p.subject === subject) setAtendances((prev) => [...prev, p]);
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, [classId]);

  async function generateQrCode(event) {
    event.preventDefault();

    if (showQrCode) {
      let confirmation = confirm(
        "Você tem certeza que deseja iniciar a aula de " + subject + "?"
      );

      if (!confirmation) {
        return;
      }
    }

    const novaIdAula = String(Date.now()) + "-" + uuidv4();

    await fetch(
      `https://unicheck.onrender.com/api/attendances/startClass?classId=${novaIdAula}`,
      {
        method: "POST",
      }
    );

    const newQrCodeValue = JSON.stringify({
      classId: novaIdAula,
      subject: subject,
    });

    setClassId(novaIdAula);
    setQrValue(newQrCodeValue);
    setShowQrCode(true);

    console.log("QR Code gerado:", newQrCodeValue);
  }

  async function endClass(event) {
    event.preventDefault();
    
    let confirmation = confirm(
      "Você tem certeza que deseja encerrar a aula de " + subject + "?"
    );

    if (!confirmation) {
      return;
    }

    await fetch(
      `https://unicheck.onrender.com/api/attendances/endClass?classId=${classId}`,
      {
        method: "POST",
      }
    );

    // Limpar cache após encerrar a aula
    clearCache();
  }

  function clearCache() {
    localStorage.removeItem("unicheck_classId");
    localStorage.removeItem("unicheck_showQrCode");
    localStorage.removeItem("unicheck_subject");
    localStorage.removeItem("unicheck_attendances");
    localStorage.removeItem("unicheck_qrValue");
    
    setClassId("");
    setShowQrCode(false);
    setSubject("");
    setAtendances([]);
    setQrValue("");
  }

  function copyTableToClipboard() {
    if (attendances.length === 0) {
      alert("Não há dados para copiar.");
      return;
    }

    const header = ["Nome", "Cadeira", "Localização", "Data e Hora"].join("\t");
    const rows = attendances.map((p) =>
      [
        p.name,
        p.subject,
        p.localization,
        new Date(p.dateTime).toLocaleString(),
      ].join("\t")
    );

    const tableText = [header, ...rows].join("\n");

    navigator.clipboard.writeText(tableText).then(
      () => {
        alert("Tabela copiada! Cole no Excel ou Google Sheets.");
      },
      () => {
        alert("Erro ao copiar a tabela.");
      }
    );
  }

  return (
    <div className="content">
      <h1> UniCheck </h1>
      <form className="teacher-form">
        <div className="formHeader">
          <button type="button" className="homeButton" onClick={() => navigate("/")}> Voltar </button>
        </div>
        <h2>Olá, { name } !</h2>
        <p>
          Nessa tela, você irá gerar o QR Code ou Código para a realização da
          presença.
        </p>

        <div className="form-group">
          <label htmlFor="subject">Cadeira</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Digite o nome da disciplina"
            disabled={showQrCode}
          />
        </div>

        {showQrCode && (
          <div className="qr-code-container">
            <QRCodeCanvas value={qrValue} size={150} key={timestamp} />
          </div>
        )}

        <div className="teacherButtons">
          <button
            onClick={(event) => generateQrCode(event)}
            disabled={!subject}
          >
            Iniciar aula
          </button>
          {showQrCode && <button className="closeClass" onClick={(event) => endClass(event)}>Encerrar aula</button>}
        </div>

        <div className="tableHeader">
          <h3>Lista de Presenças</h3>
          <button
            className="copyButton"
            onClick={copyTableToClipboard}
            disabled={attendances.length === 0}
            title="Copiar para planilha"
          >
            📋 Copiar tabela
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cadeira</th>
              <th>Localização</th>
              <th>Data e Hora</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhuma presença nessa aula
                </td>
              </tr>
            ) : (
              attendances.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.subject}</td>
                  <td><a href={p.localization}> 🗺️ Acesse no Maps</a></td>
                  <td>{new Date(p.dateTime).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </form>
      <ResponsiveLogo />
    </div>
  );
}
