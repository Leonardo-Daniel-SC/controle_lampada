export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            erro: "Método não permitido"
        });
    }

    try {

        const {
            servidor,
            caminho,
            metodo = "GET",
            body
        } = req.body || {};

        console.log("Dados recebidos pela Vercel:", {
            servidor,
            caminho,
            metodo,
            body
        });

        if (!servidor) {
            return res.status(400).json({
                erro: "Servidor não informado"
            });
        }

        // Aceita somente IPv4 com a porta 1026
        const formatoIP = /^(\d{1,3}\.){3}\d{1,3}:1026$/;

        if (!formatoIP.test(servidor)) {
            return res.status(400).json({
                erro: "Servidor inválido. Use o formato IP:1026"
            });
        }

        const partes = servidor.split(":")[0].split(".");

        if (partes.some(numero => Number(numero) > 255)) {
            return res.status(400).json({
                erro: "Endereço IP inválido"
            });
        }

        const url = `http://${servidor}${caminho}`;

        console.log("Chamando FIWARE:", {
            metodo,
            url
        });

        // Headers básicos
        const headers = {
            "fiware-service": "smart",
            "fiware-servicepath": "/",
            "accept": "application/json"
        };

        // Content-Type somente quando existe payload
        if (metodo !== "GET" && metodo !== "DELETE") {
            headers["Content-Type"] = "application/json";
        }

        const resposta = await fetch(url, {
            method: metodo,
            headers,
            body:
                metodo !== "GET" &&
                metodo !== "DELETE" &&
                body
                    ? JSON.stringify(body)
                    : undefined
        });

        const texto = await resposta.text();

        console.log("Resposta FIWARE:", {
            status: resposta.status,
            resposta: texto
        });

        try {

            const dados = JSON.parse(texto);

            return res
                .status(resposta.status)
                .json(dados);

        } catch {

            return res
                .status(resposta.status)
                .send(texto);
        }

    } catch (erro) {

        console.error(
            "Erro no proxy FIWARE:",
            erro
        );

        return res.status(500).json({
            erro: "Não foi possível conectar ao servidor FIWARE",
            detalhe: erro.message
        });
    }
}