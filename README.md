# Daily — Organizador de Rotina Diária 🗓️

![License](https://img.shields.io/badge/license-MIT-green.svg) ![Issues](https://img.shields.io/github/issues/DevWebFelipe/Daily) ![Stars](https://img.shields.io/github/stars/DevWebFelipe/Daily?style=social) ![Last Commit](https://img.shields.io/github/last-commit/DevWebFelipe/Daily) ![Repo Size](https://img.shields.io/github/repo-size/DevWebFelipe/Daily)

> **Daily** é um pequeno organizador de rotina feito em JavaScript (vanilla) que salva os dados no `localStorage` do navegador. O foco é permitir o registro de tarefas/demandas executadas ao longo do dia (com horário inicial e final), validar sobreposições e *furos* na agenda, e gerenciar listas diárias e semanais — com opção de limpar as tarefas diárias ao começar um novo dia.

---

## 📚 Sumário

* [Funcionalidades](#-funcionalidades)
* [Instalação e execução](#-instalação-e-execução)
* [Como usar](#-como-usar)
* [Persistência de dados (localStorage)](#-persistência-de-dados-localstorage)
* [Validações implementadas](#-validações-implementadas)
* [Gráficos e relatórios](#-gráficos-e-relatórios)
* [Estrutura do projeto](#-estrutura-do-projeto)
* [Como alterar comportamento / customizações rápidas](#-como-alterar-comportamento--customizações-rápidas)
* [Contribuindo (Pull Requests)](#-contribuindo-pull-requests)
* [Roadmap / ideias de melhorias](#-roadmap--ideias-de-melhorias)
* [Licença](#-licença)
* [Contato](#-contato)

---

## ✨ Funcionalidades

* Registro de tarefas/demandas com: hora inicial, hora final, número de ticket opcional e descrição.
* Validações automáticas:

  * Detecta **furos** (intervalos sem tarefa dentro do expediente);
  * Detecta **sobreposição** de horários entre tarefas;
  * Garante que as horas inseridas fiquem dentro do horário de expediente configurado;
  * Validações no momento do cadastro/edição.
* Listas separadas para **tarefas diárias** e **tarefas semanais**.
* **Quick Notes** (anotações rápidas) persistentes até exclusão manual.
* Opção de **limpar tarefas diárias** para iniciar um novo dia (mantendo semanal e quick notes).
* Export / Import (sugestão para futuras versões — ver Roadmap).

---

## 🚀 Instalação e execução

Este projeto é estático (HTML/CSS/JS). Há três formas simples de rodar:

1. **Abrir diretamente**

   * Clone o repositório e abra `index.html` no navegador.

```bash
git clone https://github.com/DevWebFelipe/Daily.git
cd Daily
# Abra index.html no seu navegador (duplo clique)
```

1. **Extensão VSCode — Live Server**

* Instale e clique em "Go Live".

---

## 🧭 Como usar

### Adicionar tarefa

1. Clique em **Adicionar tarefa**.
2. Preencha: `hora inicial`, `hora final`, `ticket` (opcional) e `descrição`.
3. Clique em **Salvar**.
4. Se houver erro na validação, o sistema informa e não salva até correção.

### Limpar tarefas diárias

* Existe um botão específico para **Zerar tarefas do dia** — ele remove apenas as tarefas marcadas como "diárias" do `localStorage`. A lista semanal e as quick notes permanecem.

### Tarefas semanais

* Adicione tarefas que são repetitivas ao longo da semana. Elas ficam salvas separadamente e não são afetadas pelo reset diário.

### Anotações rápidas (Quick Notes)

* Pequenas notas que ficam salvas até que o usuário remova manualmente.

---

## 💾 Persistência de dados (`localStorage`)

Os dados são salvos no `localStorage` do navegador — portanto persistem entre recarregamentos e fechamentos do navegador, mas ficam limitados ao browser e ao dispositivo.

> **Onde mudar as chaves ou entender o formato?**

* Abra o arquivo principal de JavaScript (ex.: `assets/js/app.js` ou `assets/js/main.js`) e procure por chamadas a `localStorage.getItem` / `localStorage.setItem`.
* Recomenda-se centralizar as chaves em constantes no topo do arquivo, por exemplo:

```js
const LS_KEYS = {
  DAILY_TASKS: 'daily_tasks',
  WEEKLY_TASKS: 'weekly_tasks',
  QUICK_NOTES: 'quick_notes'
};
```

* **Formato de armazenamento recomendado (JSON):**

```json
[
  {
    "id": "uuid-ou-timestamp",
    "start": "08:30",
    "end": "09:15",
    "ticket": "#1234",
    "description": "Atendimento ao cliente",
    "type": "daily" // ou "weekly"
  }
]
```

---

## ✅ Validações implementadas (e exemplos de código)

A lógica de validação tem 3 pontos principais:

1. **Sobreposição de horários (overlap)**

Uma regra clássica para detectar overlap entre dois intervalos A e B é:

> A e B se sobrepõem se `startA < endB && startB < endA`.

Exemplo em JavaScript (trecho reutilizável):

```js
function toMinutes(hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

function isOverlapping(aStart, aEnd, bStart, bEnd) {
  const Astart = toMinutes(aStart);
  const Aend = toMinutes(aEnd);
  const Bstart = toMinutes(bStart);
  const Bend = toMinutes(bEnd);
  return Astart < Bend && Bstart < Aend;
}
```

> Use essa função ao salvar/editar uma tarefa para verificar colisões com as tarefas existentes do mesmo dia.

2. **Furos no dia (gaps)**

* Para identificar furos, ordene as tarefas do dia por `start` e verifique se `end` da tarefa `i` é menor que `start` da tarefa `i+1`.

```js
function findGaps(tasksSorted) {
  const gaps = [];
  for (let i = 0; i < tasksSorted.length - 1; i++) {
    const endCurrent = toMinutes(tasksSorted[i].end);
    const startNext = toMinutes(tasksSorted[i+1].start);
    if (endCurrent < startNext) {
      gaps.push({ from: tasksSorted[i].end, to: tasksSorted[i+1].start });
    }
  }
  return gaps;
}
```

3. **Horário de expediente**

* Defina constantes para o horário de início/fim do expediente, e valide se cada tarefa está dentro deste intervalo:

```js
const WORK_DAY = { start: '08:00', end: '18:00' };

function withinWorkHours(start, end) {
  return toMinutes(start) >= toMinutes(WORK_DAY.start) && toMinutes(end) <= toMinutes(WORK_DAY.end);
}
```

**Observação:** trate casos limites (ex.: tarefas que começam antes da meia-noite ou cruzam dias). Para simplicidade, este projeto assume tarefas no mesmo dia.

---

## 📊 Gráficos e relatórios

O README usa *placeholders* para imagens — o projeto pode gerar gráficos usando bibliotecas como **Chart.js** (recomendado pela simplicidade).

Exemplo mínimo para inserir um gráfico de barras com Chart.js (incluir a CDN no `index.html`):

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<canvas id="hoursChart" width="400" height="200"></canvas>
```

```js
const ctx = document.getElementById('hoursChart').getContext('2d');
const hoursPerTask = {
  labels: ['Atendimento', 'Dev', 'Reunião'],
  data: [2.5, 4, 1.25]
};
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: hoursPerTask.labels,
    datasets: [{ label: 'Horas', data: hoursPerTask.data }]
  }
});
```

**Sugestão UX:** mostrar um resumo diário com: total de horas trabalhadas, porcentagem do expediente ocupada e gráficos com as tarefas que absorveram mais tempo.

---

## 🗂️ Estrutura do projeto (sugestão / como está)

```
Daily/
├─ index.html
├─ README.md
├─ LICENSE
├─ assets/
│  ├─ styles/
│  │  └─ components.css
│  │  └─ global.css
│  │  └─ index.css
│  │  └─ layout.css
│  │  └─ main.css
│  │  └─ reset.css
│  │  └─ variables.css
│  ├─ scripts/
│     └─ app.js       # lógica principal (tasks, validations, storage)
└─ .gitignore
```

---

## 🔧 Como alterar comportamento / customizações rápidas

### Mudar horário de expediente

Edite as constantes (ex.: `WORK_DAY`) no arquivo JS principal.

### Mudar formato de data/hora

Se desejar suporte a formatos distintos ou timezone, considere usar uma lib (ex.: [date-fns](https://date-fns.org/) ou [Luxon](https://moment.github.io/luxon/)).

### Mudar chaves do localStorage

Centralize as chaves em um objeto `LS_KEYS` no topo do arquivo JS e use esse objeto em todas as operações de leitura/gravação.

### Adicionar exportação/importação JSON

* Export: `localStorage.getItem(LS_KEYS.DAILY_TASKS)` → salvar arquivo `.json` via `Blob`.
* Import: ler arquivo JSON e mesclar/validar antes de salvar.

### Tornar horário editável na UI

Crie um modal/config pra alterar `WORK_DAY.start` e `WORK_DAY.end` e persista nas `settings` no `localStorage`.

---

## 🤝 Contribuindo (Pull Requests)

Obrigado por querer contribuir! Algumas diretrizes para PRs:

1. **Abra uma issue** descrevendo o problema/feature antes de começar (ajuda a alinhar expectativas).
2. Faça um **fork** do repositório e trabalhe em uma branch com nome descritivo:

```
git checkout -b feat/add-chartjs
git commit -m "feat: adiciona gráfico de horas por tarefa"
```

3. Siga o padrão de **commits claros** e escreva uma descrição no PR.
4. Adicione screenshots quando alterar UI/UX.
5. Teste localmente (verifique `localStorage` e comportamentos ao limpar/recuperar dados).
6. Mantenha compatibilidade com usuários existentes (não quebre chaves de `localStorage` sem migração).

**Modelo curto de PR description:**

* O que foi alterado
* Por que foi necessário
* Como testar localmente
* Riscos / notas

---

## 🧾 Changelog (como manter)

Use um arquivo `CHANGELOG.md` ou GitHub Releases para registrar alterações. Padrão recomendado: [Keep a Changelog](https://keepachangelog.com/).

---

## 🛣️ Roadmap / ideias de melhorias

* Import/Export JSON/CSV
* Sincronização via WebDAV / Google Drive / API (opcional)
* Autenticação e multi-device (com backend)
* Filtro/Busca por ticket/descrição
* Notificações (remind) e integração com calendário
* Testes automatizados (unitários) para funções de validação

---

## 📜 Licença

Este projeto pode usar a **MIT License**. Crie um arquivo `LICENSE` com o texto padrão da MIT.

```text
MIT License

Copyright (c) <ano> <seu-nome>

Permission is hereby granted...
```

---

## 📬 Contato

Se quiser me avisar sobre algo específico, abra uma *issue* ou envie um *pull request*. Se preferir contato direto, deixe informações no `CONTRIBUTING.md`.

---
