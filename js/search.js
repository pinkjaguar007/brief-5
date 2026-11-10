///// page recherche : valider le nom puis ouvrir profil.html

import { isValidUsername } from './utils.js'

const form = document.querySelector("#search-form")
const input = document.querySelector("#username-input")
const error = document.querySelector("#username-error")


form.addEventListener("submit", function (event) {
    event.preventDefault()

    const username = input.value.trim()

    if (!isValidUsername(username)) {
        error.textContent = "Nom invalide."
        error.classList.remove("hidden")
        input.classList.add("border-red-500")
        input.focus()
        return
    }

    window.location.href = "profil.html?username=" + encodeURIComponent(username)
})


// cache l'erreur quand on retape
input.addEventListener("input", function () {
    error.classList.add("hidden")
    input.classList.remove("border-red-500")
})
