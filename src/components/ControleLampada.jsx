import { useState } from "react";

const ControleLampada = ({ onDeviceCreated }) => {

    // const [status, setStatus] = useState("Desligada");
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
            setMensagemDevice("Criando dispositivo...");

            // 1. Provisiona o device no IoT Agent (porta 4041)
            //    409 = já existe, o que não é erro
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

            if (!respDevice.ok && respDevice.status !== 409) {
                const texto = await respDevice.text();
                throw new Error(`IoT Agent (${respDevice.status}): ${texto}`);
            }

            // 2. Verifica se já existe registro de comandos para essa entidade (porta 1026)
            const rLista = await chamarFiware(
                "/v2/registrations",
                { method: "GET", headers: { ...HEADERS_FIWARE, accept: "application/json" } },
                1026
            );
            const registros = rLista.ok ? await rLista.json() : [];
            const jaRegistrado = registros.some((reg) =>
                reg.dataProvided?.entities?.some((e) => e.id === entityName)
            );

            // 3. Só cria o registro se ainda não existir
            if (!jaRegistrado) {
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
            }

            setMensagemDevice(
                respDevice.status === 409
                    ? `Dispositivo ${deviceId} já existia; registro de comandos verificado.`
                    : `Dispositivo ${deviceId} criado e registrado.`
            );
            onDeviceCreated({
                id,
                titulo: `Dispositivo ${id}`,
            });
            setNovoDeviceId("");
        } catch (erro) {
            console.error(erro);
            setMensagemDevice(`Erro ao criar Dispositivo: ${erro.message}`);
        }
    };

    const deletarDevice = async () => {
        const id = novoDeviceId.trim();

        if (!servidor.trim()) {
            setMensagemDevice("Configure o IP do servidor primeiro.");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(id)) {
            setMensagemDevice("Informe o ID do dispositivo (ex: 003).");
            return;
        }
        if (!window.confirm(`Apagar o Dispositivo lamp${id} e todos os seus dados?`)) {
            return;
        }

        const deviceId = `lamp${id}`;
        const entityName = `urn:ngsi-ld:Lamp:${id}`;
        // 404 = já não existe, o que para a exclusão também é sucesso
        const okOu404 = (r) => r.ok || r.status === 404;

        try {
            setMensagemDevice("Deletando dispositivo...");

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

            setMensagemDevice(`Dispositivo ${deviceId} deletado.`);
            setNovoDeviceId("");
        } catch (erro) {
            console.error(erro);
            setMensagemDevice(`Erro ao deletar dispositivo: ${erro.message}`);
        }
    };

    // PÁGINA
    return ( 
        <div className="container-principal">
            <div className="container-card ">
                <div className="card-section">
                    <p className="servidor-titulo">Gerenciar dispositivos</p>
                    <input
                        type="text"
                        className="caixa-ip"
                        placeholder="ID do dispositivo (ex: 003)"
                        value={novoDeviceId}
                        onChange={(e) => setNovoDeviceId(e.target.value)}
                    />
                    <div className="btn-row-top">
                        <button className="card__btn btn-on" onClick={criarDevice}>Criar dispositivo</button>
                        <button className="card__btn btn-off" onClick={deletarDevice}>Deletar dispositivo</button>
                    </div>
                    {mensagemDevice && <p className="card__status">{mensagemDevice}</p>}
                </div>

            </div>
        </div>
    );
};

export default ControleLampada;
