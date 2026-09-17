# 💡 Smart Lamp

> Sistema de controle e monitoramento de uma lâmpada inteligente utilizando **ESP32, MQTT, FIWARE e React**.

<p align="start">
  <a href="https://controle-lampada.vercel.app/">
    <img src="https://img.shields.io/badge/🌐%20Acessar%20Projeto-000000?style=for-the-badge" alt="Acessar Projeto">
  </a>
</p>

## 📋 Sobre o Projeto

O **Smart Lamp** é um projeto de Internet das Coisas (IoT), desenvolvido com base na **PoC (Proof of Concept) Smart Lamp** apresentada no material **FIWARE Descomplicado**, que utiliza um **ESP32** integrado à plataforma FIWARE para representar uma lâmpada conectada.

Como extensão da proposta original, este projeto possui uma interface web desenvolvida em **React e JavaScript**, permitindo que o usuário interaja com a lâmpada e consulte informações do dispositivo de maneira visual e intuitiva.

A infraestrutura FIWARE é executada em um servidor na **AWS**, enquanto a aplicação web é disponibilizada através da **Vercel** ( sendo também possível utilizar um modelo local no lugar da Vercel ).



## 🎯 Objetivos

### Objetivo geral

Desenvolver uma solução IoT capaz de controlar e monitorar uma lâmpada inteligente utilizando protocolos e tecnologias de comunicação.

### Objetivos específicos

* Controlar o estado da lâmpada remotamente;
* Ligar e desligar a lâmpada através da aplicação web;
* Consultar o nível de luminosidade;
* Utilizar MQTT para comunicação entre o dispositivo IoT e a infraestrutura FIWARE;
* Utilizar o Orion Context Broker para gerenciamento dos dados;
* Criar uma interface web utilizando React;
* Integrar a aplicação web com a API do FIWARE;
* Hospedar a infraestrutura FIWARE em um servidor AWS;
* Disponibilizar a aplicação web através da Vercel;
* Demonstrar a integração entre hardware, back-end e front-end.

<br/>

## 🗂️ Arquitetura do Projeto

A solução é composta por diferentes camadas responsáveis pela comunicação entre o dispositivo físico e a aplicação web.

```text
                         ┌──────────────────────┐
                         │       USUÁRIO        │
                         │                      │
                         │    Navegador Web     │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │       VERCEL         │
                         │                      │
                         │   Aplicação React    │
                         │                      │
                         │   API /api/fiware    │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP / NGSI-v2
                                    ▼
                    ┌───────────────────────────────┐
                    │              AWS              │
                    │                               │
                    │      Orion Context Broker     │
                    │                               │
                    │             FIWARE            │
                    └───────────────┬───────────────┘
                                    │
                                    │ MQTT
                                    ▼
                         ┌──────────────────────┐
                         │      MQTT Broker     │
                         │                      │
                         │   IoT Agent MQTT     │
                         └──────────┬───────────┘
                                    │
                                    │ MQTT
                                    ▼
                         ┌──────────────────────┐
                         │        ESP32         │
                         │                      │
                         │      Smart Lamp      │
                         │                      │
                         │   Ligada/Desligada   │
                         │     Luminosidade     │
                         └──────────────────────┘
```

<br/>

## 🔄 Funcionamento
O funcionamento do projeto pode ser dividido em ligar ou desligar a lâmpada e consultar luminosidade.

<details>
  <summary>🔍 Saiba mais sobre o funcionamento: </summary>


  ### 💡 Controle da lâmpada

  Quando o usuário seleciona **Ligar** ou **Desligar** na aplicação React:

  ```text
  Usuário
    │
    ▼
  React
    │
    ▼
  API da Vercel
    │
    ▼
  FIWARE / Orion
    │
    ▼
  IoT Agent MQTT
    │
    ▼
  ESP32
    │
    ▼
  💡 Lâmpada
  ```

  A aplicação envia um comando para a entidade da lâmpada no FIWARE.

  O comando utilizado possui a seguinte estrutura:

  ```json
  {
      "on": {
          "type": "command",
          "value": ""
      }
  }
  ```

  Para desligar:

  ```json
  {
      "off": {
          "type": "command",
          "value": ""
      }
  }
  ```

  <br/>

  ### 📊 Consulta de luminosidade

  A aplicação também permite consultar o valor de luminosidade armazenado na entidade da lâmpada.

  O fluxo ocorre da seguinte forma:

  ```text
  React
    │
    ▼
  API Vercel
    │
    ▼
  Orion Context Broker
    │
    ▼
  Entidade Smart Lamp
    │
    ▼
  Atributo luminosity
    │
    ▼
  React
    │
    ▼
  📊 Exibição da luminosidade
  ```
</details>
<br/>

## 🛠️ Tecnologias utilizadas

![ESP32](https://img.shields.io/badge/ESP32-E34F26?style=for-the-badge\&logo=smartthings\&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-fff?style=for-the-badge\&logo=icloud\&logoColor=black)
![FIWARE](https://img.shields.io/badge/FIWARE-blue?style=for-the-badge\&logo=jquery\&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-00BC45?style=for-the-badge\&logo=MQTT\&logoColor=white)
![React](https://img.shields.io/badge/React-000?style=for-the-badge\&logo=React\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge\&logo=Vercel\&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF880F?style=for-the-badge\&logo=postman\&logoColor=white)


<details>
  <summary>👉🏼Saiba mais sobre cada tecnologia:</summary>

  ## 🔌 ESP32
  Microcontrolador utilizado como dispositivo IoT responsável pela comunicação da lâmpada com a infraestrutura.

  O material de referência utiliza o **ESP32 DEVKIT V1** como plataforma de prototipação para a PoC Smart Lamp.

  <br/>

  ## ☁️ AWS

  A infraestrutura FIWARE utilizada pelo projeto está hospedada em um servidor AWS.

  O Orion Context Broker utiliza a porta:

  ```text
  1026
  ```

  <br/>

  ## 🔗 FIWARE

  O FIWARE é utilizado como plataforma para gerenciamento dos dados da aplicação.

  A plataforma fornece componentes chamados **Generic Enablers (GEs)**, incluindo o Orion Context Broker e IoT Agents.

  Neste projeto, o FIWARE é executado em um servidor hospedado na **AWS**.

  <br/>


  ## 📡 MQTT

  O **MQTT (Message Queuing Telemetry Transport)** é utilizado para realizar a comunicação entre o dispositivo IoT e a infraestrutura FIWARE.

  A arquitetura do FIWARE Descomplicado utiliza o **IoT Agent MQTT** para integrar dispositivos MQTT ao Orion Context Broker.

  <br/>

  ## ⚛️ React

  O front-end da aplicação foi desenvolvido utilizando **React**.

  A aplicação fornece uma interface para:

  * Ligar a lâmpada;
  * Desligar a lâmpada;
  * Visualizar o estado atual;
  * Consultar a luminosidade;
  * Configurar o servidor FIWARE.

  <br/>

  ## ▲ Vercel

  A aplicação React é disponibilizada através da **Vercel**.

  Além da hospedagem do front-end, foi utilizada uma API serverless para intermediar as requisições entre a aplicação React e o servidor FIWARE.

  ```text
  React
    │
    ▼
  /api/fiware
    │
    ▼
  Servidor FIWARE
  ```

  Essa camada também permite que a aplicação web faça as requisições ao FIWARE sem realizar diretamente todas as chamadas a partir do navegador.
</details>
<br/>

## 🖥️ Configuração do servidor

O usuário informa o endereço do servidor FIWARE:

```text
Ex: 98.91.20.39:1026
```

O endereço é armazenado no navegador utilizando:

```javascript
localStorage
```
<br/>


## 🔐 Comunicação em produção

Durante o desenvolvimento local, a aplicação pode realizar a comunicação diretamente com o servidor FIWARE.

Em produção, hospedada na Vercel, a comunicação utiliza uma API intermediária:

```text
React
   │
   │ POST
   ▼
/api/fiware
   │
   │ GET / PATCH
   ▼
FIWARE
```

A API recebe informações como:

```json
{
    "servidor": "SEU_SERVIDOR:1026",
    "caminho": "/v2/entities/...",
    "metodo": "GET"
}
```
<br/>
<br/>

## 📁 Estrutura do Projeto

Estrutura aproximada da aplicação:

```text
Smart-Lamp/
│
├── api/
│   └── fiware.js
│
├── src/
│   ├── components/
│   │   └── ControleLampada.jsx
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│
├── package.json
├── vite.config.js
└── README.md
```
<br/>

## 🚀 Como executar o projeto

## 1. Clonar o repositório

```bash
git clone https://github.com/Leonardo-Daniel-SC/controle_lampada.git
```

Entre na pasta:

```bash
cd controle_lampada
```

## 2. Instalar as dependências

```bash
npm install
```

## 3. Executar

```bash
npm run dev
```

A aplicação será disponibilizada pelo Vite em um endereço semelhante a:

```text
http://localhost:5173
```

<br/>

## ☁️ Configuração do FIWARE

Para utilizar a aplicação, é necessário possuir uma infraestrutura FIWARE disponível.

**FIWARE Descomplicado** foi O material utilizado como referência, baseado em Docker, contendo componentes como Orion Context Broker, IoT Agent MQTT, STH-Comet, MongoDB e Eclipse Mosquitto.

Para executar o FIWARE Descomplicado, utilize a plataforma AWS para iniciar um servidor com sistema Ubunto.

No terminal do servidor, execute:

```bash
git clone https://github.com/fabiocabrini/fiware
```

Após:

```bash
sudo apt update
sudo apt install docker.io
sudo apt install docker-compose
```

Depois:

```bash
cd fiware
sudo docker-compose up -d
```

O encerramento pode ser realizado com:

```bash
sudo docker-compose down
```

<br/>

## 🔧 Testes com Postman

Durante o desenvolvimento, o **Postman** pode ser utilizado para testar diretamente a comunicação com o FIWARE.

Os testes permitem verificar:

* Estado da lâmpada;
* Comandos `on` e `off`;
* Luminosidade;
* Comunicação com o Orion Context Broker;
* Funcionamento dos endpoints NGSI-v2.

<br/>

## 🧱 Componentes do Projeto

| Componente           | Responsabilidade                               |
| -------------------- | ---------------------------------------------- |
| ESP32                | Dispositivo IoT                                |
| MQTT                 | Comunicação entre dispositivo e infraestrutura |
| IoT Agent MQTT       | Integração MQTT/FIWARE                         |
| Orion Context Broker | Gerenciamento dos dados contextuais            |
| AWS                  | Hospedagem da infraestrutura FIWARE            |
| React                | Interface web                                  |
| Vercel               | Hospedagem da aplicação e API                  |
| Postman              | Testes das APIs                                |

A arquitetura do FIWARE Descomplicado utiliza Orion, IoT Agent MQTT, MongoDB e Mosquitto como componentes da infraestrutura de back-end.

<br/>

## 📸 Demonstração

### Interface

![Interface da Smart Lamp](./docs/lamp(1).png)

<br/>

### 💡 Controle da lâmpada

![Interface da Smart Lamp](./docs/lamp(2).png)

<br/>

### 📊 Consulta de luminosidade

![Interface da Smart Lamp](./docs/lamp(3).png)

<br/>


## 📚 Referência

Este projeto foi desenvolvido tendo como referência a documentação **FIWARE Descomplicado**, disponibilizada pelo professor **Fábio Henrique Cabrini**.

* [Referência Fábio Henrique Cabrini](https://github.com/fabiocabrini/fiware)
  
<br/>

## 👨‍💻 Desenvolvedores

|Nome|RM|
|---|---|
|Bernardo Suk JU|568968|
|Leonardo Daniel|574142|
|Matheus Tamataya|572842|
|Vinycius Lu|569300|
<br/>

> Projeto acadêmico desenvolvido para aplicação prática de conceitos de IoT, integração de sistemas, desenvolvimento web e computação em nuvem.