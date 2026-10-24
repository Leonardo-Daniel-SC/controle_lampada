import { useState } from "react";

const ControleLampada = () => {

    const [status, setStatus] = useState("Desligada");
    const [luminosidade, setLuminosidade] = useState(0);
    const [temperatura, setTemperatura] = useState(0);
    const [umidade, setUmidade] = useState(0);
    const [novoDeviceId, setNovoDeviceId] = useState("");
    const [mensagemDevice, setMensagemDevice] = useState("");

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
        const destino = porta ? `${getHost()}:${porta}` : servidor.trim();

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
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs/luminosidade",
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
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs/temperatura",
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
                "/v2/entities/urn:ngsi-ld:Lamp:002/attrs/umidade",
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

    const criarDevice = async () => {
        const id = novoDeviceId.trim();

        if (!servidor.trim()) {
            setMensagemDevice("Configure o IP do servidor primeiro.");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            setMensagemDevice("Use apenas letras e números no ID (ex: 003).");
            return;
        }

        const deviceId = `lamp${id}`;
        const entityName = `urn:ngsi-ld:Lamp:${id}`;

        try {
            setMensagemDevice("Criando device...");

            // 1. Provisiona o device no IoT Agent (porta 4041)
            const respDevice = await chamarFiware(
                "/iot/devices",
                {
                    method: "POST",
                    headers: HEADERS_FIWARE_JSON,
                    body: JSON.stringify({
                        devices: [
                            {
                                device_id: deviceId,
                                entity_name: entityName,
                                entity_type: "Lamp",
                                protocol: "PDI-IoTA-UltraLight",
                                transport: "MQTT",
                                commands: [
                                    { name: "on", type: "command" },
                                    { name: "off", type: "command" }
                                ],
                                attributes: [
                                    { object_id: "s", name: "state", type: "Text" },
                                    { object_id: "l", name: "luminosity", type: "Integer" },
                                    { object_id: "t", name: "temperature", type: "Float" },
                                    { object_id: "h", name: "humidity", type: "Float" }
                                ]
                            }
                        ]
                    })
                },
                4041
            );

            if (!respDevice.ok) {
                const texto = await respDevice.text();
                throw new Error(`IoT Agent (${respDevice.status}): ${texto}`);
            }

            // 2. Registra os comandos on/off no Orion (porta 1026)
            const respReg = await chamarFiware(
                "/v2/registrations",
                {
                    method: "POST",
                    headers: HEADERS_FIWARE_JSON,
                    body: JSON.stringify({
                        description: `Lamp Commands ${deviceId}`,
                        dataProvided: {
                            entities: [{ id: entityName, type: "Lamp" }],
                            attrs: ["on", "off"]
                        },
                        provider: {
                            http: { url: `http://${getHost()}:4041` },
                            legacyForwarding: true
                        }
                    })
                },
                1026
            );

            if (!respReg.ok) {
                const texto = await respReg.text();
                throw new Error(`Registro de comandos (${respReg.status}): ${texto}`);
            }

            setMensagemDevice(`Device ${deviceId} criado e registrado.`);
            setNovoDeviceId("");
        } catch (erro) {
            console.error(erro);
            setMensagemDevice(`Erro ao criar device: ${erro.message}`);
        }
    };

    const deletarDevice = async () => {
        const id = novoDeviceId.trim();

        if (!servidor.trim()) {
            setMensagemDevice("Configure o IP do servidor primeiro.");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            setMensagemDevice("Informe o ID do device (ex: 003).");
            return;
        }
        if (!window.confirm(`Apagar o device lamp${id} e todos os seus dados?`)) {
            return;
        }

        const deviceId = `lamp${id}`;
        const entityName = `urn:ngsi-ld:Lamp:${id}`;
        // 404 = já não existe, o que para a exclusão também é sucesso
        const okOu404 = (r) => r.ok || r.status === 404;

        try {
            setMensagemDevice("Deletando device...");

            // 1. Remove o device do IoT Agent
            const r1 = await chamarFiware(
                `/iot/devices/${deviceId}`,
                { method: "DELETE", headers: HEADERS_FIWARE },
                4041
            );
            if (!okOu404(r1)) throw new Error(`IoT Agent: ${r1.status}`);

            // 2. Remove os registros de comandos ligados a essa entidade
            const rLista = await chamarFiware(
                "/v2/registrations",
                { method: "GET", headers: { ...HEADERS_FIWARE, accept: "application/json" } },
                1026
            );
            if (rLista.ok) {
                const registros = await rLista.json();
                const doDevice = registros.filter((reg) =>
                    reg.dataProvided?.entities?.some((e) => e.id === entityName)
                );
                for (const reg of doDevice) {
                    await chamarFiware(
                        `/v2/registrations/${reg.id}`,
                        { method: "DELETE", headers: HEADERS_FIWARE },
                        1026
                    );
                }
            }

            // 3. Remove a entidade do Orion
            const r3 = await chamarFiware(
                `/v2/entities/${entityName}`,
                { method: "DELETE", headers: HEADERS_FIWARE },
                1026
            );
            if (!okOu404(r3)) throw new Error(`Orion: ${r3.status}`);

            setMensagemDevice(`Device ${deviceId} deletado.`);
            setNovoDeviceId("");
        } catch (erro) {
            console.error(erro);
            setMensagemDevice(`Erro ao deletar device: ${erro.message}`);
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

                <div>
                    <button className="card__btn btn-cons" onClick={consultarTemperatura}>Consultar temperatura</button>

                    <div className="card-section">
                        <div className="container-luminosidade">
                            <p className="card__luminosidade">Nível de temperatura: <span>{temperatura}</span></p>
                        </div>
                    </div>
                </div>

                <div>
                    <button className="card__btn btn-cons" onClick={consultarUmidade}>Consultar umidade</button>

                    <div className="card-section">
                        <div className="container-luminosidade">
                            <p className="card__luminosidade">Nível de umidade: <span>{umidade}</span></p>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <p className="servidor-titulo">Gerenciar devices</p>
                    <input
                        type="text"
                        className="caixa-ip"
                        placeholder="ID do device (ex: 003)"
                        value={novoDeviceId}
                        onChange={(e) => setNovoDeviceId(e.target.value)}
                    />
                    <div className="btn-row-top">
                        <button className="card__btn btn-on" onClick={criarDevice}>Criar device</button>
                        <button className="card__btn btn-off" onClick={deletarDevice}>Deletar device</button>
                    </div>
                    {mensagemDevice && <p className="card__status">{mensagemDevice}</p>}
                </div>

            </div>
        </div>
    );
};

export default ControleLampada;