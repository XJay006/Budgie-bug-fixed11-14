import { root } from "./elements.js";
import { createUserFirebase, signinFirebase } from "../controller/firebase_auth.js";


export async function createAccountPageView() {
    const response = await fetch('/view/templates/create_account_page_template.html', {
        cache: 'no-store'
    });
    const divWrapper = document.createElement('div');
    divWrapper.style.width = "400px";
    divWrapper.classList.add("m-4", "p-4");
    divWrapper.innerHTML = await response.text();

    const form = divWrapper.querySelector('#createaccount-form');
    form.onsubmit = createUserFirebase;

    root.innerHTML = ''; // Clear current page rendering
    root.appendChild(divWrapper);

}