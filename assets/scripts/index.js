// ---------- Seletores principais ----------
const addButtons = document.querySelectorAll(".btn-add")
const notes = document.querySelector(".notes textarea")
const lists = document.querySelectorAll(".task-list")
const timeGrid = document.getElementById("time-grid")

// ---------- Helpers ----------
const timeToMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return null
  const parts = hhmm.split(":")
  if (parts.length !== 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

// ---------- Persistência ----------
function saveData() {
  const data = { notes: notes.value, lists: {} }

  lists.forEach((list) => {
    const items = []
    list.querySelectorAll("li").forEach((li) => {
      const obj = {}
      if (list.id === "weekly-tickets") {
        obj.status = li.querySelector("select").value
        obj.text = li.querySelector("input[type='text']").value
      } else if (list.id === "time-grid") {
        obj.start = li.querySelector(".start").value
        obj.end = li.querySelector(".end").value
        obj.task = li.querySelector(".task").value
      } else {
        obj.text = li.querySelector("input[type='text']").value
      }
      items.push(obj)
    })
    data.lists[list.id] = items
  })

  localStorage.setItem("dailyData", JSON.stringify(data))
}

function loadData() {
  const saved = localStorage.getItem("dailyData")
  if (!saved) return
  const data = JSON.parse(saved)

  notes.value = data.notes || ""

  for (const [id, items] of Object.entries(data.lists || {})) {
    const list = document.getElementById(id)
    if (!list) continue
    items.forEach((item) => {
      if (id === "weekly-tickets") addWeeklyTicket(list, item.text, item.status)
      else if (id === "time-grid")
        addTimeRow(list, item.start, item.end, item.task)
      else addSimpleItem(list, item.text)
    })
  }
}

// ---------- Adição de itens ----------
function addWeeklyTicket(list, text = "", status = "Aguardando") {
  const index = list.children.length + 1
  const li = document.createElement("li")
  li.className = "task-item"

  li.innerHTML = `
    <select aria-label="Status do ticket">
      <option value="Aguardando">Aguardando</option>
      <option value="Em andamento">Em andamento</option>
      <option value="Finalizado">Finalizado</option>
    </select>
    <input type="text" value="${text || `${index} - `}" />
    <button class="btn-delete" title="Excluir">✖</button>
  `

  const select = li.querySelector("select")
  select.value = status
  applyStatusStyle(li, status)

  select.addEventListener("change", () => {
    applyStatusStyle(li, select.value)
    saveData()
  })

  const input = li.querySelector("input[type='text']")
  input.addEventListener("input", saveData)

  li.querySelector(".btn-delete").addEventListener("click", () => {
    li.remove()
    updateWeeklyIndices(list)
    saveData()
  })

  list.appendChild(li)
  saveData()
}

function addSimpleItem(list, text = "") {
  const li = document.createElement("li")
  li.className = "task-item"

  li.innerHTML = `
    <input type="text" value="${text}" />
    <button class="btn-delete" title="Excluir">✖</button>
  `

  li.querySelector("input[type='text']").addEventListener("input", saveData)
  li.querySelector(".btn-delete").addEventListener("click", () => {
    li.remove()
    saveData()
  })

  list.appendChild(li)
  saveData()
}

// Adiciona uma linha de horário (com listeners)
function addTimeRow(list, start = "", end = "", task = "") {
  const li = document.createElement("li")
  li.className = "task-item"

  li.innerHTML = `
    <input type="time" class="start" value="${start}" />
    <input type="time" class="end" value="${end}" />
    <input type="text" class="task" value="${task}" placeholder="Tarefa executada" />
    <button class="btn-delete" title="Excluir">✖</button>
  `

  // listeners: salvar + validar ao editar
  li.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      saveData()
      validateTimeGrid(list)
    })
  })

  li.querySelector(".btn-delete").addEventListener("click", () => {
    li.remove()
    saveData()
    validateTimeGrid(list)
  })

  list.appendChild(li)
  saveData()
  validateTimeGrid(list)
}

// Função que garante o comportamento especial do botão de horários
function addTimeGrid(list) {
  const items = list.querySelectorAll("li")
  if (items.length === 0) {
    // primeira vez: adiciona 3 blocos padrão
    addTimeRow(list, "08:00", "08:10", "")
    addTimeRow(list, "08:10", "08:25", "Reunião diária")
    addTimeRow(list, "08:25", "", "")
  } else {
    // pega último end disponível (se vazio, usa '')
    const lastItem = list.querySelector("li:last-child")
    const lastEnd = lastItem.querySelector(".end").value || ""
    addTimeRow(list, lastEnd, "", "")
  }
}

// ---------- Validação da grade de horários ----------
function validateTimeGrid(list) {
  const rows = Array.from(list.querySelectorAll("li"))
  rows.forEach((li) => li.classList.remove("invalid-time", "gap-time"))

  let lastEndMinutes = null

  rows.forEach((li, idx) => {
    const startVal = li.querySelector(".start").value
    const endVal = li.querySelector(".end").value

    const startMin = timeToMinutes(startVal)
    const endMin = timeToMinutes(endVal)

    // 1) horário inválido (end antes do start)
    if (startMin !== null && endMin !== null && endMin < startMin) {
      li.classList.add("invalid-time")
    }

    // 2) gap entre o lastEnd e o start atual (apenas se lastEnd existe)
    if (lastEndMinutes !== null && startMin !== null) {
      if (startMin > lastEndMinutes) {
        // marca o atual e o anterior (se existir)
        li.classList.add("gap-time")
        if (idx - 1 >= 0) rows[idx - 1].classList.add("gap-time")
      }
    }

    // atualiza lastEndMinutes: preferir end se existir, senão manter lastEndMinutes
    if (endMin !== null) lastEndMinutes = endMin
    else if (startMin !== null && lastEndMinutes === null) {
      // se não existia lastEnd e existe apenas start, usar start como referência
      lastEndMinutes = startMin
    }
  })
}

// ---------- Índices semanais (corrige prefixo com regex) ----------
function updateWeeklyIndices(list) {
  ;[...list.children].forEach((li, i) => {
    const input = li.querySelector("input[type='text']")
    if (input) {
      // remove prefixo numérico atual (ex: "12 - ") e adiciona o novo índice
      const newText = input.value.replace(/^\s*\d+\s*-\s*/, "")
      input.value = `${i + 1} - ${newText}`
    }
  })
}

// ---------- Estilo por status ----------
function applyStatusStyle(li, status) {
  li.classList.remove("status-progress", "status-done")
  if (status === "Em andamento") li.classList.add("status-progress")
  if (status === "Finalizado") li.classList.add("status-done")
}

// ---------- Limpar listas (exceto semanal) ----------
function clearDailyLists() {
  document.querySelectorAll(".task-list").forEach((list) => {
    if (list.id !== "weekly-tickets") list.innerHTML = ""
  })
  notes.value = ""
  saveData()
  validateTimeGrid(timeGrid)
}

// ---------- Eventos dos botões + botão limpar global ----------
addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const list = document.getElementById(btn.dataset.list)
    if (!list) return
    if (btn.dataset.list === "weekly-tickets") addWeeklyTicket(list)
    else if (btn.dataset.list === "time-grid")
      addTimeGrid(list) // usa comportamento especial
    else addSimpleItem(list)
  })
})

// cria e adiciona botão de limpar abaixo do main
const clearBtn = document.createElement("button")
clearBtn.textContent = "Limpar Listas Diárias"
clearBtn.className = "btn-clear"
clearBtn.addEventListener("click", clearDailyLists)
document.querySelector("main").appendChild(clearBtn)

// ---------- Inicialização ----------
loadData()
// importante: validar após carregar (assim as linhas salvas ficam destacadas conforme necessário)
validateTimeGrid(timeGrid)
