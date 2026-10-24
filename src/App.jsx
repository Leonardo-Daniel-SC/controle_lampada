import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ControleLampada from "./components/ControleLampada"
import Home from "./pages/Home"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useState } from "react";

const App = () => {
  const [dispositivos, setDispositivos] = useState([]);

  const adicionarDispositivo = (dispositivo) => {
    setDispositivos((atuais) =>
      atuais.some((item) => item.id === dispositivo.id)
        ? atuais
        : [...atuais, dispositivo]
    );
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-[#141414] p-1">
        <Header/>
        <ControleLampada onDeviceCreated={adicionarDispositivo} />
          <Routes>
            <Route path="/" element={<Home dispositivos={dispositivos} />}/>
          </Routes>
        <Footer/>
      </div>
    </Router>
  )
}

export default App
