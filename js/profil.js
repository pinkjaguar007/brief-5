///// page profil : le développeur, ses dépôts et l'ajout à la shortlist

import { getUser, getRepos, getCandidates, addCandidate } from './api.js'
import { isValidUsername, textOr, formatDate, githubErrorMessage } from './utils.js'


const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const searchError = document.querySelector("#search-error")

const loading = document.querySelector("#loading")
const errorBox = document.querySelector("#error")
const errorMessage = document.querySelector("#error-message")
const retryBtn = document.querySelector("#retry-btn")

const profileSection = document.querySelector("#profile")
const avatarBox = document.querySelector("#avatar-box")
const profileName = document.querySelector("#profile-name")
const profileLogin = document.querySelector("#profile-login")
const profileBio = document.querySelector("#profile-bio")
const profileLocation = document.querySelector("#profile-location")
const profileDate = document.querySelector("#profile-date")
const profileRepos = document.querySelector("#profile-repos")
const profileFollowers = document.querySelector("#profile-followers")
const profileFollowing = document.querySelector("#profile-following")
const profileLink = document.querySelector("#profile-link")
const addBtn = document.querySelector("#add-btn")
const addMessage = document.querySelector("#add-message")

const reposSection = document.querySelector("#repos")
const reposEmpty = document.querySelector("#repos-empty")
const reposList = document.querySelector("#repos-list")


let currentUser = null
let allRepos = []

// nom lu dans l'adresse : profil.html?username=...
const username = new URLSearchParams(window.location.search).get("username")


///// états de la page (chargement / erreur)

function showLoading() {
    loading.classList.remove("hidden")
    errorBox.classList.add("hidden")
    profileSection.classList.add("hidden")
    reposSection.classList.add("hidden")
}


function showError(message, withRetry) {
    loading.classList.add("hidden")
    errorBox.classList.remove("hidden")
    errorMessage.textContent = message
    retryBtn.classList.toggle("hidden", !withRetry)
}


///// chargement du profil et des dépôts

async function loadProfile(name) {
    showLoading()

    try {
        const [user, repos] = await Promise.all([
            getUser(name),
            getRepos(name)
        ])

        currentUser = user
        allRepos = repos

        renderProfile(user)
        renderRepos()
        checkShortlist(user)
    } catch (error) {
        showError(githubErrorMessage(error), error.message === "network")
    }
}


function renderProfile(user) {
    // l'avatar est créé en js pour ne pas avoir d'image vide dans le html
    const avatar = document.createElement("img")
    avatar.src = user.avatar_url
    avatar.alt = "Photo de profil de " + user.login
    avatar.className = "size-24 rounded-full border border-slate-200 object-cover"
    avatarBox.replaceChildren(avatar)

    profileName.textContent = textOr(user.name, "Nom non renseigné")
    profileLogin.textContent = "@" + user.login
    profileBio.textContent = textOr(user.bio, "Aucune bio.")
    profileLocation.textContent = "Ville : " + textOr(user.location, "non renseignée")
    profileDate.textContent = "Inscrit le " + formatDate(user.created_at)
    profileRepos.textContent = textOr(user.public_repos, 0)
    profileFollowers.textContent = textOr(user.followers, 0)
    profileFollowing.textContent = textOr(user.following, 0)
    profileLink.href = user.html_url

    // le bouton attend la vérification de la shortlist
    addBtn.disabled = true
    addBtn.textContent = "Vérification..."
    addMessage.classList.add("hidden")

    searchInput.value = user.login
    loading.classList.add("hidden")
    profileSection.classList.remove("hidden")
    reposSection.classList.remove("hidden")
}


///// ajout à la shortlist (sans doublon)

function candidateExists(candidates, login) {
    return candidates.some(function (candidate) {
        return textOr(candidate.login, "").toLowerCase() === login.toLowerCase()
    })
}


async function checkShortlist(user) {
    try {
        const candidates = await getCandidates()

        if (candidateExists(candidates, user.login)) {
            addBtn.textContent = "Déjà dans la shortlist"
        } else {
            addBtn.disabled = false
            addBtn.textContent = "Ajouter à la shortlist"
        }
    } catch (error) {
        // pas bloquant : la vérification sera refaite au moment du clic
        addBtn.disabled = false
        addBtn.textContent = "Ajouter à la shortlist"
    }
}


addBtn.addEventListener("click", async function () {
    if (currentUser === null) return

    addBtn.disabled = true
    addBtn.textContent = "Ajout..."
    addMessage.classList.add("hidden")

    try {
        const candidates = await getCandidates()

        if (candidateExists(candidates, currentUser.login)) {
            addBtn.textContent = "Déjà dans la shortlist"
            showAddMessage("Déjà dans la shortlist.", false)
            return
        }

        const candidate = {
            login: currentUser.login,
            name: textOr(currentUser.name, currentUser.login),
            avatar_url: currentUser.avatar_url,
            html_url: currentUser.html_url,
            location: textOr(currentUser.location, ""),
            public_repos: currentUser.public_repos,
            followers: currentUser.followers,
            added_at: new Date().toISOString()
        }

        await addCandidate(candidate)

        addBtn.textContent = "Ajouté à la shortlist"
        showAddMessage("Candidat ajouté.", true)
    } catch (error) {
        addBtn.disabled = false
        addBtn.textContent = "Ajouter à la shortlist"

        if (error.message === "network") {
            showAddMessage("Erreur réseau.", false)
        } else {
            showAddMessage("Ajout impossible.", false)
        }
    }
})


function showAddMessage(message, success) {
    addMessage.textContent = message
    addMessage.classList.remove("hidden", "text-slate-700", "text-red-600")

    if (success) {
        addMessage.classList.add("text-slate-700")
    } else {
        addMessage.classList.add("text-red-600")
    }
}


///// dépôts

function renderRepos() {
    reposList.replaceChildren()

    allRepos.forEach(function (repo) {
        reposList.appendChild(createRepoCard(repo))
    })

    if (allRepos.length === 0) {
        reposEmpty.textContent = "Aucun dépôt."
        reposEmpty.classList.remove("hidden")
    } else {
        reposEmpty.classList.add("hidden")
    }
}


function createRepoCard(repo) {
    const card = document.createElement("article")
    card.className = "flex h-full flex-col rounded border border-slate-200 bg-white p-4"

    const name = document.createElement("a")
    name.href = repo.html_url
    name.target = "_blank"
    name.rel = "noopener noreferrer"
    name.textContent = repo.name
    name.className = "font-semibold text-slate-900 hover:underline"

    const description = document.createElement("p")
    description.textContent = textOr(repo.description, "Pas de description.")
    description.className = "mt-1 flex-1 text-sm text-slate-600"

    const info = document.createElement("div")
    info.className = "mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"

    const language = document.createElement("span")
    language.textContent = "Langage : " + textOr(repo.language, "non précisé")

    const stars = document.createElement("span")
    stars.textContent = "Étoiles : " + repo.stargazers_count

    const forks = document.createElement("span")
    forks.textContent = "Forks : " + repo.forks_count

    info.appendChild(language)
    info.appendChild(stars)
    info.appendChild(forks)

    const updated = document.createElement("p")
    updated.textContent = "Mis à jour le " + formatDate(repo.updated_at)
    updated.className = "mt-2 text-xs text-slate-500"

    card.appendChild(name)
    card.appendChild(description)
    card.appendChild(info)
    card.appendChild(updated)

    return card
}


///// petite barre de recherche en haut de la page

searchForm.addEventListener("submit", function (event) {
    event.preventDefault()

    const value = searchInput.value.trim()

    if (!isValidUsername(value)) {
        searchError.textContent = "Nom invalide."
        searchError.classList.remove("hidden")
        searchInput.classList.add("border-red-500")
        searchInput.focus()
        return
    }

    window.location.href = "profil.html?username=" + encodeURIComponent(value)
})

searchInput.addEventListener("input", function () {
    searchError.classList.add("hidden")
    searchInput.classList.remove("border-red-500")
})


retryBtn.addEventListener("click", function () {
    if (username !== null && isValidUsername(username)) {
        loadProfile(username)
    }
})


///// lancement de la page

if (username === null || !isValidUsername(username)) {
    showError("Nom d'utilisateur invalide.", false)
} else {
    searchInput.value = username
    loadProfile(username)
}
