import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ControleLampada from "./components/ControleLampada"
import Home from "./pages/Home"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useEffect, useState } from "react";
import Historico from "./pages/Historico"

const App = () => {
  const [dispositivos, setDispositivos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lamp-devices") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lamp-devices", JSON.stringify(dispositivos));
  }, [dispositivos]);

  const adicionarDispositivo = (dispositivo) => {
    setDispositivos((atuais) =>
      atuais.some((item) => item.id === dispositivo.id)
        ? atuais
        : [...atuais, dispositivo]
    );
  };

  const removerDispositivo = (id) => {
    setDispositivos((atuais) => atuais.filter((item) => item.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-[#141414] p-1">
        <Header/>
        <ControleLampada
          onDeviceCreated={adicionarDispositivo}
          onDeviceDeleted={removerDispositivo}
        />
          <Routes>
            <Route path="/" element={<Home dispositivos={dispositivos} />}/>
          </Routes>
        <Footer/>
      </div>
    </Router>
  )
}

export default App
