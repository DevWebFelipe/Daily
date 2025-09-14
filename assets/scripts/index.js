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

// auto-resize de textarea
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto"
  textarea.style.height = textarea.scrollHeight + "px"
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
        const txt =
          li.querySelector("textarea") || li.querySelector("input[type='text']")
        obj.text = txt.value
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
  input.focus()
}

function addSimpleItem(list, text = "") {
  const li = document.createElement("li")
  li.className = "task-item"

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.placeholder = "Descrição"
  textarea.className = "task"
  autoResizeTextarea(textarea)

  textarea.addEventListener("input", () => {
    autoResizeTextarea(textarea)
    saveData()
  })

  const del = document.createElement("button")
  del.textContent = "✖"
  del.className = "btn-delete"
  del.title = "Excluir"

  del.addEventListener("click", () => {
    li.remove()
    saveData()
  })

  li.appendChild(textarea)
  li.appendChild(del)
  list.appendChild(li)
  saveData()
  textarea.focus()
}

// adiciona uma linha de horário (com textarea na descrição)
function addTimeRow(list, start = "", end = "", task = "") {
  const li = document.createElement("li")
  li.className = "task-item"

  li.innerHTML = `
    <input type="time" class="start" value="${start}" />
    <input type="time" class="end" value="${end}" />
    <textarea class="task" placeholder="Tarefa executada">${task}</textarea>
    <button class="btn-delete" title="Excluir">✖</button>
  `

  const taskStart = li.querySelector(".start")
  const taskArea = li.querySelector(".task")
  autoResizeTextarea(taskArea)
  taskArea.addEventListener("input", () => {
    autoResizeTextarea(taskArea)
    saveData()
    validateTimeGrid(list) // validação em tempo real na área de texto
  })

  li.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      saveData()
      validateTimeGrid(list) // validação em tempo real dos inputs
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
  taskStart.focus()
}

function addTimeGrid(list) {
  const items = list.querySelectorAll("li")
  if (items.length === 0) {
    addTimeRow(list, "08:00", "08:10", "")
    addTimeRow(list, "08:10", "08:25", "Reunião diária")
    addTimeRow(list, "08:25", "", "")
  } else {
    const lastItem = list.querySelector("li:last-child")
    const lastEnd = lastItem.querySelector(".end").value || ""
    addTimeRow(list, lastEnd, "", "")
  }
}

// ---------- Validação da gride de tempo ----------
function validateTimeGrid(list) {
  const rows = Array.from(list.querySelectorAll("li"))
  rows.forEach((li) =>
    li.classList.remove("invalid-time", "gap-time", "outside-time")
  )
  rows.forEach((li) => (li.title = ""))

  let lastEndMinutes = null
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Dom, 1=Seg ... 5=Sex

  // definir horários de trabalho
  const workingHours = {
    default: [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60, end: 18 * 60 },
    ],
    friday: [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60, end: 17 * 60 },
    ],
  }
  const ranges = dayOfWeek === 5 ? workingHours.friday : workingHours.default

  rows.forEach((li, idx) => {
    const startVal = li.querySelector(".start").value
    const endVal = li.querySelector(".end").value

    const startMin = timeToMinutes(startVal)
    const endMin = timeToMinutes(endVal)

    // 1. fim < início
    if (startMin !== null && endMin !== null && endMin < startMin) {
      li.classList.add("invalid-time")
      li.title = "A hora de término não pode ser anterior à hora de início."
    }

    // 2. lacuna entre tarefas
    if (lastEndMinutes !== null && startMin !== null) {
      if (startMin > lastEndMinutes) {
        li.classList.add("gap-time")
        li.title = "Há uma lacuna entre as tarefas."
        if (idx - 1 >= 0) {
          rows[idx - 1].classList.add("gap-time")
          rows[idx - 1].title = "Há uma lacuna entre as tarefas."
        }
      }
    }

    // 3. fora do horário de trabalho
    if (startMin !== null && endMin !== null) {
      const insideRange = ranges.some(
        (r) => startMin >= r.start && endMin <= r.end
      )
      if (!insideRange) {
        li.classList.add("outside-time")
        li.title = "O horário está fora do expediente."
      }
    }

    if (endMin !== null) lastEndMinutes = endMin
    else if (startMin !== null && lastEndMinutes === null) {
      lastEndMinutes = startMin
    }
  })
}

// ---------- Índices semanais ----------
function updateWeeklyIndices(list) {
  ;[...list.children].forEach((li, i) => {
    const input = li.querySelector("input[type='text']")
    if (input) {
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
    else if (btn.dataset.list === "time-grid") addTimeGrid(list)
    else addSimpleItem(list)
  })
})

const clearBtn = document.createElement("button")
clearBtn.textContent = "Limpar Listas Diárias"
clearBtn.className = "btn-clear"
clearBtn.addEventListener("click", clearDailyLists)
document.querySelector("main").appendChild(clearBtn)

// ---------- Inicialização ----------
loadData()
validateTimeGrid(timeGrid)
