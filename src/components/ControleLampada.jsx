import { useState } from "react";

const ControleLampada = () => {
    const [status, setStatus] = useState("Desligada");
    const [luminosidade, setLuminosidade] = useState(0);

    const ligarLampada = async () => {
        try {
            const resposta = await fetch(
                "http://98.91.20.39d:1026/v2/entities/urn:ngsi-ld:Lamp:002/attrs",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "fiware-service": "smart",
                        "fiware-servicepath": "/"
                    },
                    body: JSON.stringify({
                        on: {
                            type: "command",
                            value: ""
                        }
                    })
                }
            );
            if (!resposta.ok) {
                throw new Error("Erro ao enviar comando");
            }
            setStatus("Ligada");
        } catch (erro) {
            console.error(erro);
            setStatus("Erro ao enviar comando");
        }
    };
    const desligarLampada = async () => {
        try {
            const resposta = await fetch(
                "http://98.91.20.39:1026/v2/entities/urn:ngsi-ld:Lamp:002/attrs",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "fiware-service": "smart",
                        "fiware-servicepath": "/"
                    },
                    body: JSON.stringify({
                        off: {
                            type: "command",
                            value: ""
                        }
                    })
                }
            );
            if (!resposta.ok) {
                throw new Error("Erro ao enviar comando");
            }
            setStatus("Desligada");
        } catch (erro) {
            console.error(erro);
            setStatus("Erro ao enviar comando");
        }
    };
    const consultarLuminosidade = async () => {
        try {
            const resposta = await fetch(
                "http://98.91.20.39:1026/v2/entities/urn:ngsi-ld:Lamp:002/attrs/luminosity",
                {
                    method: "GET",

                    headers: {
                        "fiware-service": "smart",
                        "fiware-servicepath": "/",
                        "accept": "application/json"
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro ao consultar luminosidade");
            }

            const dados = await resposta.json();

            console.log("Resposta do FIWARE:", dados);

            setLuminosidade(dados.value);

        } catch (erro) {
            console.error(erro);
        }
    };

    // PÁGINA
    return ( 
        <div className="container-card">
            <h1>Controle da Lâmpada</h1>

            <div className="card-section"> 
                <div className="lista-status">
                    <span className={`led ${
                        status === "Ligada"
                        ? "led-verde"
                        : status === "Desligada"
                        ? "led-vermelho"
                        : "led-cinza"
                    }`}/>
                    <span className="card__status">Status: {status}</span>
                </div>

                <div className="btn-grupo">
                    <div className="btn-row-top">
                        <button className="card__btn btn-on" onClick={ligarLampada}>Ligar lâmpada</button>
                        <button className="card__btn btn-off" onClick={desligarLampada}>Desligar lâmpada</button>
                    </div>
                    <button className="card__btn btn-cons" onClick={consultarLuminosidade}>Consultar luminosidade</button>
                </div>
            </div>

            <div className="card-section">
                <div className="container-luminosidade">
                    <p className="card__luminosidade">Nível de luminosidade: <span>{luminosidade}</span></p>
                </div>
            </div>


        </div>
    );
};

export default ControleLampada;