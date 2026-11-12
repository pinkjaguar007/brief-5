///// page shortlist : liste des candidats

import { getCandidates } from './api.js'
import { textOr, formatDate } from './utils.js'


const list = document.querySelector("#candidates-list")
const loading = document.querySelector("#loading")
const count = document.querySelector("#count")


// null tant que le GET n'a pas répondu
let candidates = null


function showLoading() {
    loading.classList.remove("hidden")
    list.replaceChildren()
}


async function loadShortlist() {
    showLoading()

    try {
        candidates = await getCandidates()
        renderCandidates()
    } catch (error) {
        console.error(error)
    }
}


function renderCandidates() {
    if (candidates === null) return

    list.replaceChildren()

    candidates.forEach(function (candidate) {
        list.appendChild(createCandidateCard(candidate))
    })

    if (candidates.length > 1) {
        count.textContent = candidates.length + " candidats"
    } else {
        count.textContent = candidates.length + " candidat"
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


///// lancement de la page

loadShortlist()
