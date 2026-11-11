///// toutes les requêtes de l'application

const GITHUB_API = "https://api.github.com"

// remplace cette adresse par celle de ta collection MockAPI (voir README)
const MOCKAPI_URL = "https://VOTRE-ID.mockapi.io/api/v1/candidates"

// tant que l'adresse MockAPI n'est pas configurée, la shortlist est gardée
// dans le navigateur pour que l'application reste utilisable
const DEMO_MODE = MOCKAPI_URL.includes("VOTRE-ID")
const STORAGE_KEY = "devscope-candidates"


///// nombre de requêtes GitHub restantes (en-tête x-ratelimit-remaining)

function showRateLimit() {
    const element = document.querySelector("#ratelimit")

    if (element === null) return

    const remaining = sessionStorage.getItem("ratelimit")

    if (remaining === null) {
        element.textContent = "GitHub : —"
    } else {
        element.textContent = "GitHub : " + remaining
    }
}

function updateRateLimit(response) {
    const remaining = response.headers.get("x-ratelimit-remaining")

    if (remaining === null) return

    sessionStorage.setItem("ratelimit", remaining)
    showRateLimit()
}

showRateLimit()


///// fonction de base pour tous les appels
// fetch + async / await, response.ok vérifié avant d'utiliser les données

export async function request(url, options = {}) {
    let response

    try {
        response = await fetch(url, options)
    } catch (error) {
        throw new Error("network")
    }

    updateRateLimit(response)

    if (!response.ok) {
        if (response.status === 404) throw new Error("not_found")
        if (response.status === 403 || response.status === 429) throw new Error("rate_limit")
        throw new Error("http_" + response.status)
    }

    return response.json()
}


///// API GitHub

export function getUser(username) {
    return request(GITHUB_API + "/users/" + encodeURIComponent(username))
}

export function getRepos(username) {
    return request(GITHUB_API + "/users/" + encodeURIComponent(username) + "/repos?per_page=100&sort=updated")
}


///// API MockAPI (la shortlist)

export async function getCandidates() {
    if (DEMO_MODE) {
        const saved = localStorage.getItem(STORAGE_KEY)

        if (saved === null) return []

        return JSON.parse(saved)
    }

    return request(MOCKAPI_URL)
}

export async function addCandidate(candidate) {
    if (DEMO_MODE) {
        const candidates = await getCandidates()
        candidates.push(candidate)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates))
        return candidate
    }

    return request(MOCKAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate)
    })
}
