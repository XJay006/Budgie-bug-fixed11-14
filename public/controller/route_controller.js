import { createAccountPageView } from "../view/createAccount_page.js";
import { homePageView } from "../view/home_page.js";
import { incomePageView } from "../view/income_page.js";
import { SettingsPageView } from "../view/settings_page.js";
import { signinPageView } from "../view/signin_page.js";
import {initializeAccountView} from "../view/initalizeAccount_page.js"
import { expensePageView } from "../view/expense_page.js";
import { householdPageView } from "../view/household_page.js";

function navigateTo(e, route) {
    e.preventDefault();
    history.pushState(null, null, route);
    router();
}

export const routePathNames = {
    HOME: '/',
    EXPENSES: '/expenses',
    INCOME: '/income',
    SETTINGS: '/settings',
    SIGNIN: '/signin',
    CREATEACCOUNT: '/createaccount',
    INITIALIZEACCOUNT: '/initializeaccount',
    HOUSEHOLD:'/household',
    // Add more routes as needed
};

async function router() {
    const routes = {
        // For new routes, replace the placeholder string with the corresponding view function like is done with the home route
        '/': homePageView,
        '/expenses': expensePageView,
        '/income': incomePageView,
        '/settings': SettingsPageView,
        '/signin': signinPageView,
        '/createaccount': createAccountPageView,
        '/initializeaccount': initializeAccountView,
        '/household': householdPageView,
        // Add more routes as needed
    };

    const path = window.location.pathname;

    if (typeof routes[path] === 'function') {
        await routes[path]();
    } else {
        const content = routes[path] || '<h1>404 - Page Not Found</h1>';
        document.getElementById('root').innerHTML = content;
    }


    updateActiveLink(path);
}

function updateActiveLink(path) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


window.onpopstate = router; // Handle back/forward button navigation
window.onload = router; // Load initial route
window.navigateTo = navigateTo; // Expose navigateTo function to the global scope

export { navigateTo, router as routing };