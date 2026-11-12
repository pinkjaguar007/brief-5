///// page shortlist : liste des candidats, recherche et tri

import { getCandidates } from './api.js'
import { textOr, formatDate } from './utils.js'


const list = document.querySelector("#candidates-list")
const loading = document.querySelector("#loading")
const errorBox = document.querySelector("#error")
const errorMessage = document.querySelector("#error-message")
const retryBtn = document.querySelector("#retry-btn")
const empty = document.querySelector("#empty")
const count = document.querySelector("#count")
const searchInput = document.querySelector("#search-input")
const sortSelect = document.querySelector("#sort-select")


// null tant que le GET n'a pas répondu
let candidates = null


function showLoading() {
    loading.classList.remove("hidden")
    errorBox.classList.add("hidden")
    empty.classList.add("hidden")
    list.replaceChildren()
}


function showError(message) {
    loading.classList.add("hidden")
    errorBox.classList.remove("hidden")
    errorMessage.textContent = message
    list.replaceChildren()
}


async function loadShortlist() {
    showLoading()

    try {
        candidates = await getCandidates()
        renderCandidates()
    } catch (error) {
        count.textContent = "0 candidat"

        if (error.message === "network") {
            showError("Erreur réseau.")
        } else {
            showError("Chargement impossible.")
        }
    }
}


function addedTime(candidate) {
    if (!candidate.added_at) return 0

    const time = new Date(candidate.added_at).getTime()

    if (isNaN(time)) return 0

    return time
}


function renderCandidates() {
    if (candidates === null) return

    const search = searchInput.value.trim().toLowerCase()
    const sort = sortSelect.value

    const results = candidates.filter(function (candidate) {
        const name = textOr(candidate.name, "").toLowerCase()
        const login = textOr(candidate.login, "").toLowerCase()
        return name.includes(search) || login.includes(search)
    })

    results.sort(function (a, b) {
        if (sort === "name") {
            const nameA = textOr(a.name, a.login).toLowerCase()
            const nameB = textOr(b.name, b.login).toLowerCase()
            return nameA.localeCompare(nameB)
        }

        if (sort === "oldest") {
            return addedTime(a) - addedTime(b)
        }

        return addedTime(b) - addedTime(a)
    })

    list.replaceChildren()

    results.forEach(function (candidate) {
        list.appendChild(createCandidateCard(candidate))
    })

    if (candidates.length > 1) {
        count.textContent = candidates.length + " candidats"
    } else {
        count.textContent = candidates.length + " candidat"
    }

    if (candidates.length === 0) {
        empty.textContent = "Aucun candidat."
        empty.classList.remove("hidden")
    } else if (results.length === 0) {
        empty.textContent = "Aucun résultat."
        empty.classList.remove("hidden")
    } else {
        empty.classList.add("hidden")
    }

    loading.classList.add("hidden")
}


function createCandidateCard(candidate) {
    const card = document.createElement("article")
    card.className = "flex items-center gap-3 rounded border border-slate-200 bg-white p-4"

    if (candidate.avatar_url) {
        const avatar = document.createElement("img")
        avatar.src = candidate.avatar_url
        avatar.alt = "Photo de " + textOr(candidate.login, "candidat")
        avatar.className = "size-12 shrink-0 rounded-full border border-slate-200 object-cover"
        card.appendChild(avatar)
    }

    const info = document.createElement("div")
    info.className = "min-w-0 flex-1"

    const name = document.createElement("p")
    name.textContent = textOr(candidate.name, "Nom non renseigné")
    name.className = "truncate font-semibold text-slate-900"

    const login = document.createElement("p")
    login.textContent = "@" + textOr(candidate.login, "inconnu")
    login.className = "truncate text-sm text-slate-500"

    info.appendChild(name)
    info.appendChild(login)

    const side = document.createElement("div")
    side.className = "shrink-0 text-right"

    if (candidate.added_at) {
        const date = document.createElement("p")
        date.textContent = "Ajouté le " + formatDate(candidate.added_at)
        date.className = "text-xs text-slate-500"
        side.appendChild(date)
    }

    if (candidate.login) {
        const link = document.createElement("a")
        link.href = "profil.html?username=" + encodeURIComponent(candidate.login)
        link.textContent = "Voir le profil"
        link.className = "mt-1 inline-block text-sm text-slate-900 hover:underline"
        side.appendChild(link)
    }

    card.appendChild(info)
    card.appendChild(side)

    return card
}


searchInput.addEventListener("input", function () {
    if (candidates !== null) {
        renderCandidates()
    }
})

sortSelect.addEventListener("change", function () {
    if (candidates !== null) {
        renderCandidates()
    }
})

retryBtn.addEventListener("click", function () {
    loadShortlist()
})


///// lancement de la page

loadShortlist()
