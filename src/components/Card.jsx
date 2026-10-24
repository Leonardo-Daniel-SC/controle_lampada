import { useState } from 'react';

const HistoricoGrafico = ({ titulo, unidade, pontos, cor }) => {
    const dados = pontos.slice(-30);

    if (dados.length === 0) {
        return <div className="historico-grafico"><h3>{titulo}</h3><p>Nenhuma leitura encontrada no histórico do STH-Comet.</p></div>;
    }

    const valores = dados.map((ponto) => ponto.valor);
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const amplitude = maximo - minimo || 1;
    const coordenadas = dados.map((ponto, indice) => ({
        ...ponto,
        x: dados.length === 1 ? 160 : 24 + (indice * 272) / (dados.length - 1),
        y: 112 - ((ponto.valor - minimo) / amplitude) * 88,
    }));
    const linha = coordenadas.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");

    return (
        <div className="historico-grafico">
            <h3>{titulo}</h3>
            <svg viewBox="0 0 320 140" role="img" aria-label={`Histórico de ${titulo}`}>
                <line x1="24" y1="112" x2="296" y2="112" className="historico-eixo" />
                <line x1="24" y1="20" x2="24" y2="112" className="historico-eixo" />
                <polyline points={linha} fill="none" stroke={cor} strokeWidth="3" />
                {coordenadas.map((ponto, indice) => (
                    <circle key={`${ponto.data}-${indice}`} cx={ponto.x} cy={ponto.y} r="4" fill={cor}>
                        <title>{`${new Date(ponto.data).toLocaleString("pt-BR")}: ${ponto.valor} ${unidade}`}</title>
                    </circle>
                ))}
            </svg>
            <div className="historico-legenda">
                <span>Mínimo: {minimo} {unidade}</span>
                <span>Máximo: {maximo} {unidade}</span>
            </div>
            <small>{new Date(dados[0].data).toLocaleString("pt-BR")} — {new Date(dados[dados.length - 1].data).toLocaleString("pt-BR")}</small>
        </div>
    );
};


const Card = ({ id, titulo }) => {
    const [status, setStatus] = useState("Desligada");
    const [luminosidade, setLuminosidade] = useState(0);
    const [temperatura, setTemperatura] = useState(0);
    const [umidade, setUmidade] = useState(0);
    const [historico, setHistorico] = useState({ luminosity: [], temperature: [], humidity: [] });
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [erroHistorico, setErroHistorico] = useState("");
    const [mensagemHistorico, setMensagemHistorico] = useState("");

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
                `/v2/entities/urn:ngsi-ld:Lamp:${id}/attrs`,
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
                `/v2/entities/urn:ngsi-ld:Lamp:${id}/attrs`,
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
                `/v2/entities/urn:ngsi-ld:Lamp:${id}/attrs/luminosity`,
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
                `/v2/entities/urn:ngsi-ld:Lamp:${id}/attrs/temperature`,
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
                `/v2/entities/urn:ngsi-ld:Lamp:${id}/attrs/humidity`,
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

    const garantirAssinaturaHistorico = async (entidade) => {
        const atributosHistorico = ["luminosity", "temperature", "humidity"];
        const urlNotificacao = `http://${getHost()}:8666/notify`;
        const respostaLista = await chamarFiware(
            "/v2/subscriptions",
            { method: "GET", headers: { ...HEADERS_FIWARE, accept: "application/json" } },
            1026
        );

        if (!respostaLista.ok) {
            const texto = await respostaLista.text();
            throw new Error(`Não foi possível verificar a assinatura do histórico (${respostaLista.status}): ${texto}`);
        }

        const assinaturas = await respostaLista.json();
        const jaConfigurada = assinaturas.some((assinatura) =>
            assinatura.subject?.entities?.some((item) => item.id === entidade) &&
            assinatura.notification?.http?.url === urlNotificacao &&
            atributosHistorico.every((atributo) => assinatura.notification?.attrs?.includes(atributo))
        );

        if (jaConfigurada) return false;

        const respostaCriacao = await chamarFiware(
            "/v2/subscriptions",
            {
                method: "POST",
                headers: HEADERS_FIWARE_JSON,
                body: JSON.stringify({
                    description: `Histórico ${entidade}`,
                    subject: {
                        entities: [{ id: entidade, type: "Lamp" }],
                        condition: { attrs: atributosHistorico },
                    },
                    notification: {
                        http: { url: urlNotificacao },
                        attrs: atributosHistorico,
                        attrsFormat: "legacy",
                    },
                }),
            },
            1026
        );

        if (!respostaCriacao.ok) {
            const texto = await respostaCriacao.text();
            throw new Error(`Não foi possível ativar o histórico (${respostaCriacao.status}): ${texto}`);
        }

        return true;
    };

    const exibirHistorico = async () => {
        if (historicoAberto) {
            setHistoricoAberto(false);
            return;
        }

        if (!servidor.trim()) {
            setErroHistorico("Configure o IP do servidor FIWARE antes de consultar o histórico.");
            setHistoricoAberto(true);
            return;
        }

        setHistoricoAberto(true);
        setCarregandoHistorico(true);
        setErroHistorico("");
        setMensagemHistorico("");

        const entidade = `urn:ngsi-ld:Lamp:${id}`;
        const consultarAtributoHistorico = async (atributo) => {
            const caminho = `/STH/v1/contextEntities/type/Lamp/id/${entidade}/attributes/${atributo}?lastN=30`;
            const resposta = await chamarFiware(caminho, {
                method: "GET",
                headers: { ...HEADERS_FIWARE, accept: "application/json" },
            }, 8666);

            if (!resposta.ok) {
                const texto = await resposta.text();
                throw new Error(`Falha ao consultar ${atributo} (${resposta.status}): ${texto}`);
            }

            const respostaJson = await resposta.json();
            const atributos = respostaJson.contextResponses?.flatMap(
                (contexto) => contexto.contextElement?.attributes ?? []
            ) ?? [];
            const atributoHistorico = atributos.find((item) => item.name === atributo);
            const valores = respostaJson.values ?? atributoHistorico?.values ?? [];

            return valores
                .map((item) => ({
                    data: item.recvTime ?? item.timestamp ?? item.time,
                    valor: Number(item.attrValue ?? item.value),
                }))
                .filter((item) => item.data && Number.isFinite(item.valor))
                .sort((a, b) => new Date(a.data) - new Date(b.data));
        };

        try {
            const assinaturaCriada = await garantirAssinaturaHistorico(entidade);
            const [luminosity, temperature, humidity] = await Promise.all([
                consultarAtributoHistorico("luminosity"),
                consultarAtributoHistorico("temperature"),
                consultarAtributoHistorico("humidity"),
            ]);
            setHistorico({ luminosity, temperature, humidity });
            if (assinaturaCriada) {
                setMensagemHistorico("Captura do histórico ativada. As próximas leituras enviadas pelo dispositivo aparecerão aqui.");
            }
        } catch (erro) {
            console.error(erro);
            setErroHistorico(erro.message || "Não foi possível carregar o histórico da AWS.");
        } finally {
            setCarregandoHistorico(false);
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
            <div className='container-btn'>
                <button className="card__btn btn-cons btn-novo pb-2" onClick={exibirHistorico}>
                    {historicoAberto ? "Fechar histórico" : "Analisar histórico"}
                </button>
            </div>    
            {historicoAberto && (
                <section className="historico-painel" aria-live="polite">
                    <h2>Histórico — {titulo}</h2>
                    {carregandoHistorico && <p>Buscando leituras na AWS...</p>}
                    {erroHistorico && <p className="historico-erro">{erroHistorico}</p>}
                    {mensagemHistorico && <p className="historico-mensagem">{mensagemHistorico}</p>}
                    {!carregandoHistorico && !erroHistorico && (
                        <div className="historico-graficos">
                            <HistoricoGrafico titulo="Luminosidade" unidade="lx" pontos={historico.luminosity} cor="#fca22f" />
                            <HistoricoGrafico titulo="Temperatura" unidade="°C" pontos={historico.temperature} cor="#ef6461" />
                            <HistoricoGrafico titulo="Umidade" unidade="%" pontos={historico.humidity} cor="#55a8ff" />
                        </div>
                    )}
                </section>
            )}
        </div>
    </div>
    );
}

export default Card
