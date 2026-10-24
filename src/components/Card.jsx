import React, { useState } from 'react';


const Card = ({ id, titulo }) => {
    const [status, setStatus] = useState("Desligada");
    const [luminosidade, setLuminosidade] = useState(0);
    const [temperatura, setTemperatura] = useState(0);
    const [umidade, setUmidade] = useState(0);

    const HEADERS_FIWARE = {
        "fiware-service": "smart",
        "fiware-servicepath": "/"
    };

    const HEADERS_FIWARE_JSON = {
        "Content-Type": "application/json",
        ...HEADERS_FIWARE
    };

    // Recupera o último servidor salvo no navegador
    const [servidor, setServidor] = useState( () => 
        localStorage.getItem("fiware-servidor") || "" 
    );

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
    const getHost = () =>
        servidor.trim().replace(/^https?:\/\//, "").split(":")[0];

    const chamarFiware = async (caminho, opcoes = {}, porta = null) => {
        // Se não informar porta, usa exatamente o que foi digitado no campo
        const destino = `${getHost()}:${porta || 1026}`;

        // Quando estiver publicado no Vercel
        if (import.meta.env.PROD) {
            const dados = {
                servidor: destino,
                caminho: caminho,
                metodo: opcoes.method || "GET",
                body: opcoes.body ? JSON.parse(opcoes.body) : undefined
            };
            console.log("Enviando para Vercel:", dados);
            return fetch("/api/fiware", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });
        }

        // Quando estiver rodando localmente
        return fetch(`http://${destino}${caminho}`, opcoes);
    };

    const ligarLampada = async () => {
        try {
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:001/attrs",
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
                "/v2/entities/urn:ngsi-ld:Lamp:001/attrs",
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
                "/v2/entities/urn:ngsi-ld:Lamp:001/attrs/luminosity",
                {
                    method: "GET",
                    headers: {
                        "fiware-service": "smart",
                        "fiware-servicepath": "/",
                        "accept": "application/json"
                    }
                }
            );
            console.log("Status da consulta:", resposta.status);
            const texto = await resposta.text();
            console.log("Resposta recebida:", texto);
            if (!resposta.ok) {
                throw new Error(
                    `Erro ao consultar luminosidade: ${resposta.status} - ${texto}`
                );
            }
            const dados = JSON.parse(texto);
            console.log("Dados do FIWARE:", dados);
            setLuminosidade(dados.value);

        } catch (erro) {
            console.error(erro);
        }
    };

    const consultarTemperatura = async () => {
        try {
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:001/attrs/temperature",
                {
                    method: "GET",
                    headers: {
                        "fiware-service": "smart",
                        "fiware-servicepath": "/",
                        "accept": "application/json"
                    }
                }
            );
            console.log("Status da consulta:", resposta.status);
            const texto = await resposta.text();
            console.log("Resposta recebida:", texto);
            if (!resposta.ok) {
                throw new Error(
                    `Erro ao consultar temperatura: ${resposta.status} - ${texto}`
                );
            }
            const dados = JSON.parse(texto);
            console.log("Dados do FIWARE:", dados);
            setTemperatura(dados.value);

        } catch (erro) {
            console.error(erro);
        }
    };

    const consultarUmidade = async () => {
        try {
            const resposta = await chamarFiware(
                "/v2/entities/urn:ngsi-ld:Lamp:001/attrs/humidity",
                {
                    method: "GET",
                    headers: {
                        "fiware-service": "smart",
                        "fiware-servicepath": "/",
                        "accept": "application/json"
                    }
                }
            );
            console.log("Status da consulta:", resposta.status);
            const texto = await resposta.text();
            console.log("Resposta recebida:", texto);
            if (!resposta.ok) {
                throw new Error(
                    `Erro ao consultar umidade: ${resposta.status} - ${texto}`
                );
            }
            const dados = JSON.parse(texto);
            console.log("Dados do FIWARE:", dados);
            setUmidade(dados.value);

        } catch (erro) {
            console.error(erro);
        }
    };

  return (
    <div className="">
        <div className="container-card ">
            <h1 className='card-titulo'>{titulo}</h1>
            <div className="card-section"> 
                <div className="card-informacoes">
                    <div className="card-servidor">
                        <p className="servidor-titulo">IP do servidor</p>
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
                        <button className="card__btn btn-on" onClick={ligarLampada}>Ligar dispositivo</button>
                        <button className="card__btn btn-off" onClick={desligarLampada}>Desligar dispositivo</button>
                    </div>
                    <button className="card__btn btn-cons" onClick={consultarLuminosidade}>Consultar luminosidade</button>
                    <div className="card-section">
                        <div className="container-luminosidade">
                            <p className="card__luminosidade">Nível de luminosidade: <span>{luminosidade}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='container-btn'>
                <button className="card__btn btn-cons btn-novo" onClick={consultarTemperatura}>Consultar temperatura</button>

                <div className="card-section">
                    <div className="container-luminosidade">
                        <p className="card__luminosidade">Nível de temperatura: <span>{temperatura}</span></p>
                    </div>
                </div>
            </div>

            <div className='container-btn'>
                <button className="card__btn btn-cons btn-novo" onClick={consultarUmidade}>Consultar umidade</button>

                <div className="card-section">
                    <div className="container-luminosidade">
                        <p className="card__luminosidade">Nível de umidade: <span>{umidade}</span></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Card