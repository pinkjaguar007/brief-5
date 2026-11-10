///// petits outils communs aux 3 pages

// lettres, chiffres et tirets, 1 à 39 caractères,
// sans tiret au début ni à la fin
const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/

export function isValidUsername(username) {
    return usernameRegex.test(username)
}


// texte par défaut quand l'API renvoie null, undefined ou une chaîne vide
export function textOr(value, fallback) {
    if (value === null || value === undefined || value === "") {
        return fallback
    }

    return value
}


export function formatDate(date) {
    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
        return "Date inconnue"
    }

    return parsedDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}
