document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".btn-add")
  const clearButton = document.getElementById("btn-clear")
  const notes = document.querySelector("textarea")

  // carregar dados salvos
  loadData()

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const listId = btn.dataset.list
      const ul = document.getElementById(listId)

      if (listId === "time-grid") {
        addTimeRow(ul)
      } else if (listId === "weekly-tickets") {
        addWeeklyTicket(ul)
      } else {
        addGenericItem(ul)
      }
      saveData()
    })
  })

  clearButton.addEventListener("click", () => {
    const listsToClear = [
      "review-paths",
      "review-os",
      "internal-help",
      "previous-tickets",
      "time-grid",
    ]
    listsToClear.forEach((id) => {
      document.getElementById(id).innerHTML = ""
    })
    notes.value = ""
    saveData()
  })

  // salvar notas em tempo real
  notes.addEventListener("input", saveData)
})

let weeklyCounter = 1

/* --------- Funções de adicionar --------- */
function addWeeklyTicket(ul, data = null) {
  const li = document.createElement("li")
  li.className = "task-item"

  const select = document.createElement("select")
  ;["Aguardando", "Em andamento", "Finalizado"].forEach((opt) => {
    const option = document.createElement("option")
    option.value = opt
    option.textContent = opt
    if (data && data.status === opt) option.selected = true
    select.appendChild(option)
  })

  const description = document.createElement("input")
  description.type = "text"
  description.className = "description"
  description.value = data ? data.text : `Ticket #${weeklyCounter}`
  description.addEventListener("input", saveData)

  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Excluir"
  deleteBtn.addEventListener("click", () => {
    li.remove()
    saveData()
  })

  li.appendChild(select)
  li.appendChild(description)
  li.appendChild(deleteBtn)
  ul.appendChild(li)

  if (!data) weeklyCounter++
}

function addGenericItem(ul, data = null) {
  const li = document.createElement("li")
  li.className = "task-item"

  const description = document.createElement("input")
  description.type = "text"
  description.className = "description"
  description.placeholder = "Digite aqui..."
  description.value = data ? data.text : ""
  description.addEventListener("input", saveData)

  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Excluir"
  deleteBtn.addEventListener("click", () => {
    li.remove()
    saveData()
  })

  li.appendChild(description)
  li.appendChild(deleteBtn)
  ul.appendChild(li)
}

function addTimeRow(ul, data = null) {
  const li = document.createElement("li")
  li.className = "task-item"

  const start = document.createElement("input")
  start.type = "time"
  start.value = data ? data.start : ""
  start.addEventListener("input", saveData)

  const end = document.createElement("input")
  end.type = "time"
  end.value = data ? data.end : ""
  end.addEventListener("input", saveData)

  const task = document.createElement("input")
  task.type = "text"
  task.placeholder = "Tarefa executada"
  task.value = data ? data.task : ""
  task.addEventListener("input", saveData)

  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Excluir"
  deleteBtn.addEventListener("click", () => {
    li.remove()
    saveData()
  })

  li.appendChild(start)
  li.appendChild(end)
  li.appendChild(task)
  li.appendChild(deleteBtn)

  ul.appendChild(li)
}

/* --------- Local Storage --------- */
function saveData() {
  const data = {
    weeklyTickets: [],
    reviewPaths: [],
    reviewOs: [],
    internalHelp: [],
    previousTickets: [],
    timeGrid: [],
    notes: document.querySelector("textarea").value,
  }

  document.querySelectorAll("#weekly-tickets .task-item").forEach((li) => {
    data.weeklyTickets.push({
      status: li.querySelector("select").value,
      text: li.querySelector("input.description").value,
    })
  })

  document.querySelectorAll("#review-paths .task-item").forEach((li) => {
    data.reviewPaths.push({ text: li.querySelector("input").value })
  })

  document.querySelectorAll("#review-os .task-item").forEach((li) => {
    data.reviewOs.push({ text: li.querySelector("input").value })
  })

  document.querySelectorAll("#internal-help .task-item").forEach((li) => {
    data.internalHelp.push({ text: li.querySelector("input").value })
  })

  document.querySelectorAll("#previous-tickets .task-item").forEach((li) => {
    data.previousTickets.push({ text: li.querySelector("input").value })
  })

  document.querySelectorAll("#time-grid .task-item").forEach((li) => {
    data.timeGrid.push({
      start: li.querySelector("input[type='time']:nth-child(1)").value,
      end: li.querySelector("input[type='time']:nth-child(2)").value,
      task: li.querySelector("input[type='text']").value,
    })
  })

  localStorage.setItem("dailyData", JSON.stringify(data))
}

function loadData() {
  const saved = localStorage.getItem("dailyData")
  if (!saved) return

  const data = JSON.parse(saved)

  const weeklyUl = document.getElementById("weekly-tickets")
  data.weeklyTickets.forEach((item) => addWeeklyTicket(weeklyUl, item))

  const reviewPathsUl = document.getElementById("review-paths")
  data.reviewPaths.forEach((item) => addGenericItem(reviewPathsUl, item))

  const reviewOsUl = document.getElementById("review-os")
  data.reviewOs.forEach((item) => addGenericItem(reviewOsUl, item))

  const internalHelpUl = document.getElementById("internal-help")
  data.internalHelp.forEach((item) => addGenericItem(internalHelpUl, item))

  const previousUl = document.getElementById("previous-tickets")
  data.previousTickets.forEach((item) => addGenericItem(previousUl, item))

  const timeUl = document.getElementById("time-grid")
  data.timeGrid.forEach((item) => addTimeRow(timeUl, item))

  document.querySelector("textarea").value = data.notes || ""
}
