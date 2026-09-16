import { useState } from "react";

const ControleLampada = () => {
    const [status, setStatus] = useState("Desligada");
    const [luminosidade, setLuminosidade] = useState(0);
    // Recupera o último servidor salvo no navegador
    const [servidor, setServidor] = useState( () => 
        localStorage.getItem("fiware-servidor") || "" );
    // Conecta ao servidor informado
    const conectarServidor = () => { 
        if (!servidor.trim()) { alert("Digite o IP do servidor."); 
        return; 
        }
    // Salva o IP para não precisar digitar novamente
    localStorage.setItem("fiware-servidor", servidor.trim()); 
    alert("Servidor configurado!"); 
    };
    // Monta o endereço do FIWARE 
    const getFiwareUrl = () => {
        return `http://${servidor.trim()}`;
    };

    const chamarFiware = async (caminho, opcoes = {}) => {
        // Quando estiver publicado no Vercel
        if (import.meta.env.PROD) {
            return fetch("/api/fiware", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    servidor: servidor.trim(),
                    caminho: caminho,
                    metodo: opcoes.method || "GET",
                    body: opcoes.body
                        ? JSON.parse(opcoes.body)
                        : undefined
                })
            });
        }
        // Quando estiver rodando com npm run dev
        return fetch(
            `${getFiwareUrl()}${caminho}`,
            opcoes
        );
    };

    const ligarLampada = async () => {
        try {
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs",
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
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs",
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
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs/luminosity",
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
        <div className={`box ${
            status === "Ligada"
            ? "led-verde"
            : status === "Desligada"
            ? "led-vermelho"
            : ""
        }`}>
            <div className="container-card ">
                <h1>Controle da Lâmpada</h1>
                <div className="card-section"> 
                    <div className="card-informacoes">
                        <div className="card-servidor">
                            <p className="servidor-titulo">Ip do servidor</p>
                            <input type="text" name="" id="" className="caixa-ip"
                            placeholder="Ex: 98.91.20.39:1026" value={servidor} 
                            onChange={(evento) => setServidor(evento.target.value)} />
                        </div>
                        <button className="card__btn btn-on btn-cnt" onClick={conectarServidor}>Conectar</button>
                    </div>
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
        </div>
    );
};

export default ControleLampada;