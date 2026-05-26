# Mindz — Arquitetura Completa

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + React Flow |
| Backend | Node.js + Express |
| Banco de dados | MongoDB |
| IA | Gemini Flash |
| Jobs periódicos | node-cron |

---

## Schemas MongoDB

### Usuário
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string (hash)",
  "createdAt": "Date"
}
```

### Conteúdo
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "rawText": "string",
  "neurons": ["ObjectId"],
  "createdAt": "Date"
}
```

### Neurônio
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "contentId": "ObjectId",
  "concept": "string",
  "performanceStatus": "red | orange | yellow | green",
  "memoryStatus": "green | green-fading | gray | black",
  "score": "number",
  "lastReviewedAt": "Date",
  "connections": ["ObjectId"],
  "interactions": [
    {
      "timestamp": "Date",
      "responseTime": "number (ms)",
      "correct": "boolean"
    }
  ]
}
```

### Sessão
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "contentId": "ObjectId",
  "startedAt": "Date",
  "endedAt": "Date",
  "interactions": [
    {
      "neuronId": "ObjectId",
      "responseTime": "number (ms)",
      "correct": "boolean"
    }
  ]
}
```

---

## Rotas da API

### Autenticação
```
POST /auth/register
POST /auth/login
```

### Conteúdo
```
POST /content        — upload e geração dos neurônios pela IA
GET  /content/:id    — busca conteúdo com seus neurônios
```

### Neurônios
```
GET   /neurons/:contentId   — busca a rede de neurônios de um conteúdo
PATCH /neurons/:id          — atualiza status após interação
```

### Sessão
```
POST  /session              — inicia sessão de estudo
PATCH /session/:id          — registra interação
GET   /session/:id/question — busca próxima pergunta gerada pela IA
```

---

## Lógica Adaptativa

### Progressão por desempenho (performanceStatus)

**Acerto:**
- vermelho → laranja
- laranja → amarelo
- amarelo → verde
- verde-escuro → verde
- atualiza `lastReviewedAt`
- 3 acertos em sessões diferentes confirma verde permanente

**Erro:**
- verde → amarelo
- amarelo → laranja
- laranja → vermelho
- vermelho permanece vermelho

### Degradação temporal (memoryStatus)

Job diário via node-cron verificando `lastReviewedAt`:

| Tempo sem revisão | Transição |
|-------------------|-----------|
| 14 dias | green → green-fading |
| 28 dias | green-fading → gray |
| 42 dias | gray → black |

### Pontuação
- Neurônio vermelho que vira verde vale mais pontos que neurônio verde mantido verde
- Pontuação ponderada por dificuldade superada

---

## Prompts Gemini Flash

### Prompt 1 — Extração de conceitos do PDF

```
Você é um sistema de extração de conhecimento educacional.

Dado o seguinte conteúdo, extraia os conceitos principais e as conexões entre eles.

Retorne APENAS um JSON válido no seguinte formato, sem texto adicional:
{
  "neurons": [
    {
      "concept": "nome do conceito",
      "connections": ["conceito relacionado 1", "conceito relacionado 2"]
    }
  ]
}

Regras:
- Extraia entre 5 e 20 conceitos por conteúdo
- Conceitos devem ser termos específicos, não frases longas
- Conexões devem ser outros conceitos da própria lista
- Ignore informações secundárias e exemplos

Conteúdo:
{texto do PDF}
```

### Prompt 2 — Geração dinâmica de perguntas

```
Você é um tutor educacional adaptativo.

Gere UMA pergunta sobre o conceito abaixo considerando o desempenho atual do aluno.

Conceito: {concept}
Status do aluno neste conceito: {performanceStatus}
Últimas interações: {interactions}

Retorne APENAS um JSON válido, sem texto adicional:
{
  "question": "texto da pergunta",
  "answer": "resposta correta",
  "difficulty": "easy | medium | hard"
}

Regras:
- Status vermelho ou laranja: perguntas simples de reconhecimento
- Status amarelo: perguntas de compreensão
- Status verde: perguntas de aplicação e conexão com outros conceitos
- Nunca repita uma pergunta já feita nesta sessão
```

---

## Ordem de Desenvolvimento

1. Autenticação
2. Upload e extração de conceitos pela IA
3. Visualização da rede com React Flow
4. Lógica de sessão e perguntas dinâmicas
5. Degradação temporal com node-cron

---

## Contexto do Projeto

- **Deadline:** Setembro 2026 — feira internacional Argentina (Milset)
- **Desenvolvedor:** Hernandes (backend + frontend)
- **Design:** Lucas (interface, neurônios, logo — Figma)
- **Documentação:** Lucas (Canva)
- **Orientadora:** Rosiana — aprovação obtida em 25/05/2026
- **Início do desenvolvimento:** 14 de junho (férias)