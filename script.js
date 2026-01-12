let questions = []
let current = 0
let results = []

fetch("preguntes.txt")
  .then((r) => r.text())
  .then(parseQuestions)

function parseQuestions(text) {
  const blocks = text.trim().split(/\n\s*\n/)

  for (let i = 0; i < blocks.length; i += 2) {
    const qLines = blocks[i].split("\n")
    const aLines = blocks[i + 1].split("\n")

    const question = qLines[0].replace(/^\d+\.\s*/, "")
    let answers = []
    let correct = null

    aLines.forEach((l, idx) => {
      if (l.startsWith(".")) {
        correct = idx
        l = l.substring(1)
      }
      answers.push(l.substring(2).trim())
    })

    // shuffle answers within the question (Fisher–Yates) and update correct index
    if (answers.length > 1) {
      const idxs = answers.map((_, k) => k)
      for (let a = idxs.length - 1; a > 0; a--) {
        const b = Math.floor(Math.random() * (a + 1))
        const tmp = idxs[a]
        idxs[a] = idxs[b]
        idxs[b] = tmp
      }
      const shuffledAnswers = idxs.map((i) => answers[i])
      const newCorrect = idxs.indexOf(correct)
      questions.push({ question, answers: shuffledAnswers, correct: newCorrect })
    } else {
      questions.push({ question, answers, correct })
    }
  }

  // shuffle questions order (Fisher–Yates)
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = questions[i]
    questions[i] = questions[j]
    questions[j] = tmp
  }

  // reset results to match shuffled questions
  results = Array(questions.length).fill(null)

  buildIndex()
  showQuestion()
}

function buildIndex() {
  const index = document.getElementById("index")
  index.innerHTML = ""
  questions.forEach((_, i) => {
    const b = document.createElement("button")
    b.textContent = i + 1
    b.onclick = () => {
      current = i
      showQuestion()
    }
    index.appendChild(b)
  })
}

function showQuestion() {
  document.getElementById("question").textContent = current + 1 + ". " + questions[current].question

  const answersDiv = document.getElementById("answers")
  answersDiv.innerHTML = ""

  questions[current].answers.forEach((a, i) => {
    const div = document.createElement("div")
    div.textContent = a
    div.className = "answer"

    if (results[current] !== null) {
      if (i === questions[current].correct) div.classList.add("correct")
      else if (i === results[current]) div.classList.add("wrong")
    } else {
      div.onclick = () => answer(i)
    }

    answersDiv.appendChild(div)
  })

  updateIndex()
}

function answer(i) {
  results[current] = i
  showQuestion()
  updateStats()
}

function updateIndex() {
  document.querySelectorAll("#index button").forEach((b, i) => {
    b.className = ""
    if (results[i] !== null) {
      b.classList.add(results[i] === questions[i].correct ? "correct" : "incorrect")
    }
  })
}

function updateStats() {
  let ok = 0,
    fail = 0
  results.forEach((r, i) => {
    if (r !== null) {
      if (r === questions[i].correct) ok++
      else fail++
    }
  })

  document.getElementById("ok").textContent = ok
  document.getElementById("fail").textContent = fail
  document.getElementById("score").textContent = ((10 * (ok - fail / 3)) / (ok + fail)).toFixed(2)
}

function prev() {
  if (current > 0) {
    current--
    showQuestion()
  }
}

function next() {
  if (current < questions.length - 1) {
    current++
    showQuestion()
  }
}
