import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import "./qrCodeReader.css";

export default function QrCodeReader(props) {
  const webcamRef = useRef(null);
  
  const name = props.name;

  useEffect(() => {
    const interval = setInterval(() => {
      scanQRCode();
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
        console.log("QR Code detectado:", code.data);

        if (sendedRef.current) return;

        let dataReceived = JSON.parse(code.data);

        let dataPrepare = {
          name: name,
          localization: 'Faculdade'
        }

        const dataToSend = Object.assign({}, dataPrepare, dataReceived);
0
        let sended = false;
        
        if(sended) return;

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

          sendedRef.current = true;
          
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
        
      </p>
    </div>
  );
}
