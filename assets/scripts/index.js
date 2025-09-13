// Seletores principais
const addButtons = document.querySelectorAll(".btn-add")
const notes = document.querySelector(".notes textarea")
const lists = document.querySelectorAll(".task-list")

// Função para salvar no localStorage
function saveData() {
  const data = {
    notes: notes.value,
    lists: {},
  }

  lists.forEach((list) => {
    const items = []
    list.querySelectorAll("li").forEach((li) => {
      const obj = {}
      if (list.id === "weekly-tickets") {
        obj.status = li.querySelector("select").value
        obj.text = li.querySelector("input").value
      } else if (list.id === "time-grid") {
        obj.start = li.querySelector(".start").value
        obj.end = li.querySelector(".end").value
        obj.task = li.querySelector(".task").value
      } else {
        obj.text = li.querySelector("input").value
      }
      items.push(obj)
    })
    data.lists[list.id] = items
  })

  localStorage.setItem("dailyData", JSON.stringify(data))
}

// Função para carregar do localStorage
function loadData() {
  const saved = localStorage.getItem("dailyData")
  if (!saved) return
  const data = JSON.parse(saved)

  notes.value = data.notes || ""

  for (const [id, items] of Object.entries(data.lists)) {
    const list = document.getElementById(id)
    if (!list) continue
    items.forEach((item) => {
      if (id === "weekly-tickets") {
        addWeeklyTicket(list, item.text, item.status)
      } else if (id === "time-grid") {
        addTimeRow(list, item.start, item.end, item.task)
      } else {
        addSimpleItem(list, item.text)
      }
    })
  }
}

// --- Adicionar itens ---
function addWeeklyTicket(list, text = "", status = "Aguardando") {
  const index = list.children.length + 1

  const li = document.createElement("li")
  li.innerHTML = `
    <select>
      <option value="Aguardando">Aguardando</option>
      <option value="Em andamento">Em andamento</option>
      <option value="Finalizado">Finalizado</option>
    </select>
    <input type="text" value="${text || `${index} - `}" />
    <button class="btn-delete">✖</button>
  `

  const select = li.querySelector("select")
  select.value = status
  applyStatusStyle(li, status)

  select.addEventListener("change", () => {
    applyStatusStyle(li, select.value)
    saveData()
  })

  li.querySelector("input").addEventListener("input", saveData)

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
  li.innerHTML = `
    <input type="text" value="${text}" />
    <button class="btn-delete">✖</button>
  `

  li.querySelector("input").addEventListener("input", saveData)
  li.querySelector(".btn-delete").addEventListener("click", () => {
    li.remove()
    saveData()
  })

  list.appendChild(li)
  saveData()
}

function addTimeRow(list, start = "", end = "", task = "") {
  const li = document.createElement("li")
  li.innerHTML = `
    <input type="time" class="start" value="${start}" />
    <input type="time" class="end" value="${end}" />
    <input type="text" class="task" value="${task}" placeholder="Tarefa executada" />
    <button class="btn-delete">✖</button>
  `

  li.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", saveData)
  })

  li.querySelector(".btn-delete").addEventListener("click", () => {
    li.remove()
    saveData()
  })

  list.appendChild(li)
  saveData()
}

// Atualizar índices da lista semanal
function updateWeeklyIndices(list) {
  ;[...list.children].forEach((li, i) => {
    const input = li.querySelector("input")
    if (input) {
      const parts = input.value.split(" - ")
      input.value = `${i + 1} - ${parts.slice(1).join(" - ")}`
    }
  })
}

// Estilo por status
function applyStatusStyle(li, status) {
  li.classList.remove("status-progress", "status-done")
  if (status === "Em andamento") {
    li.classList.add("status-progress")
  }
  if (status === "Finalizado") {
    li.classList.add("status-done")
  }
}

// Limpar listas exceto semanal
function clearDailyLists() {
  document.querySelectorAll(".task-list").forEach((list) => {
    if (list.id !== "weekly-tickets") list.innerHTML = ""
  })
  notes.value = ""
  saveData()
}

// Eventos de adicionar
addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const list = document.getElementById(btn.dataset.list)
    if (btn.dataset.list === "weekly-tickets") addWeeklyTicket(list)
    else if (btn.dataset.list === "time-grid") addTimeRow(list)
    else addSimpleItem(list)
  })
})

// Botão global limpar
const clearBtn = document.createElement("button")
clearBtn.textContent = "Limpar Listas Diárias"
clearBtn.className = "btn-clear"
clearBtn.addEventListener("click", clearDailyLists)
document.querySelector("main").appendChild(clearBtn)

// Inicialização
loadData()
