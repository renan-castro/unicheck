import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import "./qrCodeReader.css";

export default function QrCodeReader(props) {
  const webcamRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const name = props.name;

  useEffect(() => {
    // Obter localização ao carregar o componente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Erro ao obter localização:", error.message);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocalização não suportada");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      scanQRCode();
    }, 500);
    return () => clearInterval(interval);
  }, [location]);

  const sendedRef = useRef(false);

  async function scanQRCode(){
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code){
        if (sendedRef.current) return;

        sendedRef.current = true;

        console.log("QR Code detectado:", code.data);

        let dataReceived = JSON.parse(code.data);

        // Formatar localização
        let localizationString = "Localização não disponível";
        if (location) {
          localizationString = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        }

        let dataPrepare = {
          name: name,
          localization: localizationString
        }

        const dataToSend = Object.assign({}, dataPrepare, dataReceived);

        const response = await fetch('https://unicheck.onrender.com/api/attendances/register',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        }).then(res => {
          if(!res.ok){
            throw new Error('Erro no envio, verifique se o QR Code é válido.');
          }
          
          return res.json();
        })
        .then(data => {
          console.log('Resposta do servidor:', data);
          alert('Presença registrada com sucesso!');
        })
        .catch(error => {
          console.error('Erro ao enviar dados:', error);
          alert('Erro ao registrar presença: ' + error.message);
        })
      ;
      } 
    }
  };

  return (
    <div className="qr-reader-container">
      <h1 className="qr-reader-title">Leitor de QR Code</h1>

      <div className="qr-reader-camera">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          style={{ width: "100%", height: "100%" }}
        />
        <div className="qr-reader-scanner-line"></div>
      </div>

      <p className="qr-reader-result">
        {location ? (
          <span className="location-status success">📍 Localização obtida</span>
        ) : locationError ? (
          <span className="location-status error">⚠️ {locationError}</span>
        ) : (
          <span className="location-status loading">🔄 Obtendo localização...</span>
        )}
      </p>
    </div>
  );
}
