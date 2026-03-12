# Deploy automatico na VPS (Docker)

Este projeto agora esta configurado para fazer deploy automatico na VPS quando houver `push` na branch `main`.

## Como funciona

1. O workflow `Docker Publish` publica a imagem no GHCR com a tag `main`.
2. Ao concluir com sucesso, o workflow `Deploy VPS` conecta na VPS por SSH.
3. Na VPS, ele atualiza o repositorio, faz `docker compose pull` da API e sobe com `docker compose up -d`.

## Arquivos adicionados

- `.github/workflows/deploy-vps.yml`
- `docker-compose.vps.yml`
- `scripts/deploy-vps.sh`

## Passo a passo de configuracao

### 1) Preparar a VPS (primeira vez)

Instale Docker + Docker Compose plugin na VPS e garanta que o usuario do deploy consegue rodar `docker`.

Depois:

```bash
sudo mkdir -p /opt/ranking-tenis
sudo chown -R $USER:$USER /opt/ranking-tenis
cd /opt/ranking-tenis
git clone <URL_DO_REPO> .
cp .env.example .env
```

Edite o `.env` com valores de producao, principalmente `DATABASE_URL`, `JWT_SECRET` e `JWT_REFRESH_SECRET`.

### 2) Subir a API manualmente uma vez (opcional para validar)

```bash
cd /opt/ranking-tenis
IMAGE=ghcr.io/<owner>/<repo>:main docker compose -f docker-compose.vps.yml up -d
```

### 3) Configurar secrets no GitHub

No repositorio, configure em `Settings > Secrets and variables > Actions`:

- `VPS_HOST`: IP ou dominio da VPS
- `VPS_USER`: usuario SSH
- `VPS_SSH_KEY`: chave privada SSH usada pelo GitHub Actions

### 4) Garantir permissao do pacote no GHCR

Se a imagem estiver privada, faca login no GHCR uma vez na VPS:

```bash
docker login ghcr.io -u <github-user>
```

Use um token com escopo `read:packages`. O Docker guardara as credenciais para os proximos deploys.

### 5) Testar deploy automatico

Faça um commit na `main` e `push`.

Fluxo esperado:

1. `Docker Publish` termina com sucesso.
2. `Deploy VPS` executa automaticamente.
3. API atualizada na VPS.

## Comandos uteis na VPS

```bash
cd /opt/ranking-tenis
docker compose -f docker-compose.vps.yml ps
docker compose -f docker-compose.vps.yml logs -f api
```

## Deploy manual pela VPS (fallback)

```bash
cd /opt/ranking-tenis
IMAGE=ghcr.io/<owner>/<repo>:main ./scripts/deploy-vps.sh
```
