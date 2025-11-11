import { React, useEffect, useState } from "react";
import "./studentForm.css";
import ResponsiveLogo from "../../components/responsiveLogo/responsiveLogo.jsx";
import QrCodeReader from "../../components/qrCodeReader/qrCodeReader.jsx";
import { useLocation } from "react-router-dom";

export default function studentForm() {
  const location = useLocation();
  const { name } = location.state || {};

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);

  function getPos(event){
    event.preventDefault();
    
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada neste navegador.");
      return;
    }

    console.log('Chegou');
    console.log(JSON.stringify(navigator.geolocation));


    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (err) => {
        setError(err.message);
      }
    )
  }

  return (
    <div className="content">
      <h1> UniCheck </h1>
      <form className="teacher-form">
        <div className="formHeader">
          <button className="homeButton" onClick={(event) => getPos(event)}> Voltar </button>
        </div>
        <h2>Olá, {name}!</h2>
        <p>
          Nessa tela, você irá escanear o QR Code ou inserir o Código para a
          realização da presença.
        </p>
        <QrCodeReader name={name} />
      </form>
      <ResponsiveLogo />
    </div>
  );
}
