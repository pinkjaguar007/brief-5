///// page profil : le développeur et ses dépôts

import { getUser, getRepos } from './api.js'
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

let currentUser = null
let allRepos = []

// nom lu dans l'adresse : profil.html?username=...
const username = new URLSearchParams(window.location.search).get("username")


///// états de la page (chargement / erreur)

function showLoading() {
    loading.classList.remove("hidden")
    errorBox.classList.add("hidden")
    profileSection.classList.add("hidden")
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

    // l'ajout à la shortlist arrive plus tard
    addBtn.disabled = true

    searchInput.value = user.login
    loading.classList.add("hidden")
    profileSection.classList.remove("hidden")
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
