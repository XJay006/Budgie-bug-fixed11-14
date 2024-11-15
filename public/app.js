

attachAuthStateChangeObserver();



import { attachAuthStateChangeObserver, signoutFirebase } from "./controller/firebase_auth.js"

// Reusable functions to set and get the theme from localstorage
const getStoredTheme = () => localStorage.getItem('theme')
const setStoredTheme = theme => localStorage.setItem('theme', theme)

// Pull system/browser theme preference and set the theme
const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
        return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setTheme = theme => {
    document.documentElement.setAttribute('data-bs-theme', theme)
}

setTheme(getPreferredTheme());

attachAuthStateChangeObserver();

// This handles the theme switcher button
const showActiveTheme = (theme) => {
    const themeSwitchers = document.querySelectorAll('.dark-mode-toggle')
    const themeSwitcherIcons = document.querySelectorAll('.dark-mode-toggle-icon')

    const newTheme = theme === 'light' ? 'dark' : 'light'
    themeSwitchers.forEach(themeSwitcher => {
        themeSwitcher.onclick = () => {
            setStoredTheme(newTheme)
            setTheme(newTheme)
            showActiveTheme(newTheme)
        }
    });

    themeSwitcherIcons.forEach(themeSwitcherIcon => {
        themeSwitcherIcon.classList.add('fa-solid', 'fa-xl');
        if (newTheme === 'dark') {
            themeSwitcherIcon.classList.remove('fa-sun')
            themeSwitcherIcon.classList.add('fa-moon')
        } else {
            themeSwitcherIcon.classList.remove('fa-moon')
            themeSwitcherIcon.classList.add('fa-sun')
        }
    });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
        setTheme(getPreferredTheme())
    }
})

window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
        .forEach(toggle => {
            toggle.addEventListener('click', () => {
                const theme = toggle.getAttribute('data-bs-theme-value')
                setStoredTheme(theme)
                setTheme(theme)
                showActiveTheme(theme, true)
            })
        })
})

document.addEventListener('DOMContentLoaded', () => {
    const signoutButton = document.getElementById('signoutButton');
    
    if (signoutButton) {
        signoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default link behavior
            signoutFirebase();  // Call the function to sign out
        });
    }
});

