import { React, useEffect, useLayoutEffect, useState } from "react";
import "./teacherForm.css";
import { QRCodeCanvas } from "qrcode.react";
import ResponsiveLogo from "../../components/responsiveLogo/responsiveLogo.jsx";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function teacherForm() {
  const [classId, setClassId] = useState("");
  const [timestamp, setTimestamp] = useState(Date.now());
  const [showQrCode, setShowQrCode] = useState(false);
  const [subject, setSubject] = useState("");
  const [attendances, setAtendances] = useState([]);
  const [qrValue, setQrValue] = useState("");

  const location = useLocation();
  const { name } = location.state || {};

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
  }

  return (
    <div className="content">
      <h1> UniCheck </h1>
      <form className="teacher-form">
        <div className="formHeader">
          <button className="homeButton"> Voltar </button>
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
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Digite o nome da disciplina"
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
                  <td>{p.localization}</td>
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
