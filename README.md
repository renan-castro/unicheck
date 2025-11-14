## Unicheck

Aplicação para gestão de chamada (presença) desenvolvida como projeto de estudo. Consiste em um backend em Spring Boot (Java 21) e um frontend em React + Vite. Suporta WebSocket (STOMP/SockJS) para notificações em tempo-real e persistência via PostgreSQL.

## Tecnologias

- Backend: Java 21, Spring Boot 3.5.6, Spring Data JPA, WebSocket (STOMP/SockJS)
- Banco de dados: PostgreSQL (driver incluído como runtime)
- Frontend: React 19, Vite, React Router, bibliotecas para leitura de QR e webcam
- Build: Maven (wrapper `mvnw` incluso), Node + npm/Yarn
- Container: Docker (Dockerfile do backend incluído)

## Estrutura do repositório (resumida)

- backend/unicheck/ — aplicação Spring Boot (módulo backend)
  - src/main/java/com/unicheck/unicheck — código Java (controller, service, model, repository, config)
  - src/main/resources/application.properties — variáveis de conexão com DB
  - Dockerfile — build multi-stage para gerar imagem do backend
- frontend/ — aplicação React com Vite
  - package.json — scripts e dependências (dev/build/preview)

> Nota: Também existe uma cópia `src/` com código compilado/organizado; foco principal para desenvolvimento ativo é `backend/unicheck` e `frontend`.

## Requisitos

- Java 21 (ou use o `Dockerfile` que instala o JDK durante build)
- Maven (opcional — pode usar o wrapper `./mvnw`)
- Node 18+ e npm (ou yarn)
- PostgreSQL (ou outro datasource compatível). As configurações do datasource são feitas via variáveis de ambiente.

## Variáveis de ambiente (backend)

O backend lê a configuração do datasource via variáveis de ambiente (definidas em `application.properties`):

- DB_URL — URL JDBC do PostgreSQL (ex: `jdbc:postgresql://localhost:5432/unicheckdb`)
- DB_USER — usuário do banco
- DB_PASSWORD — senha do banco

Antes de iniciar o backend localmente, exporte essas variáveis ou forneça via ambiente de sua ferramenta (IDE, Docker, etc.).

## Como rodar localmente

1) Backend (modo desenvolvimento)

```bash
cd backend/unicheck
# Unix: use o wrapper incluído
./mvnw spring-boot:run

# ou, se preferir com Maven instalado globalmente:
mvn -f pom.xml spring-boot:run
```

Observações:
- A aplicação roda por padrão na porta 8080.
- O `application.properties` do projeto referencia variáveis de ambiente: `DB_URL`, `DB_USER`, `DB_PASSWORD`.

2) Frontend (modo desenvolvimento)

```bash
cd frontend
npm install
npm run dev
```

Por padrão o Vite executa em `http://localhost:5173` — o backend já permite CORS para essa origem (ver `CorsConfig`).

3) Build para produção

Backend (gera JAR):

```bash
cd backend/unicheck
./mvnw clean package
# Executar o JAR resultante
java -jar target/unicheck-0.0.1-SNAPSHOT.jar
```

Frontend (gera assets estáticos):

```bash
cd frontend
npm run build
# Os arquivos finais ficam em `dist/` (padrão do Vite)
```

## Endpoints principais (backend)

- GET  /api/attendances?classId={id} — listar presenças por classId (parâmetro opcional)
- POST /api/attendances/register — registrar uma nova presença (body JSON com objeto Attendance)
- POST /api/attendances/startClass?classId={id} — iniciar chamada/registro para uma turma
- POST /api/attendances/endClass?classId={id} — encerrar chamada/registro para uma turma

Modelos/contratos: consulte `backend/unicheck/src/main/java/com/unicheck/unicheck/model/Attendance.java` para o shape do objeto `Attendance` esperado pelo endpoint de registro.

## WebSocket (tempo-real)

- Endpoint STOMP/SockJS: `/unicheck-websocket` (registrado em `WebSocketConfig`)
- Broker simples: tópicos iniciados com `/topics` (ex.: `/topics/someTopic`)
- Prefixo para destinos de aplicação: `/app`

O frontend já inclui dependências para STOMP e SockJS (`@stomp/stompjs`, `sockjs-client`) e o código do servidor espera conexões do origin `http://localhost:5173`.

## Docker

O backend inclui um `Dockerfile` multi-stage. Exemplo de build e run:

```bash
# Na raiz do projeto ou em backend/unicheck
cd backend/unicheck
docker build -t unicheck-backend .

# Rodar a imagem, fornecendo as variáveis do banco
docker run -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://host_do_db:5432/unicheckdb" \
  -e DB_USER="usuario" \
  -e DB_PASSWORD="senha" \
  unicheck-backend
```

Observação: não há Dockerfile oficial do frontend fornecido no repositório; você pode servir os arquivos estáticos do `npm run build` com um Nginx simples ou usar uma imagem node para servir o bundle.

## Desenvolvimento e testes rápidos

- Código fonte do backend: `backend/unicheck/src/main/java/`.
- Para rodar testes (se houver), use `./mvnw test` no diretório do backend.

## Próximos passos sugeridos

- Adicionar um `docker-compose.yml` para orquestrar backend + banco + frontend (preview)
- Documentar o formato JSON do `Attendance` no README (ex.: incluir um exemplo de payload)
- Adicionar scripts de CI (build/test) e badge de status no README

## Contato / Contribuição

Contribuições são bem-vindas. Abra issues ou pull requests no repositório.

---
Arquivo gerado automaticamente pelo assistente de desenvolvimento com base na estrutura do projeto.
