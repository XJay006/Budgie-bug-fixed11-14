import { root } from "./elements.js";
import { signinFirebase } from "../controller/firebase_auth.js";
import { createAccountPageView } from "./createAccount_page.js";
import { incomePageView } from "./income_page.js";


export async function signinPageView() {
  const response = await fetch('/view/templates/signin_page_template.html', {
    cache: 'no-store'
  });

  const divWrapper = document.createElement('div');
  divWrapper.style.width = "400px";
  divWrapper.classList.add("m-4", "p-4");
  divWrapper.innerHTML = await response.text();

  // Attach form submit event listener
  const form = divWrapper.querySelector('#signin-form');
  form.onsubmit = signinFirebase;

 
  // find the "Create Account" button in the signin_page.html template
  const createAccountButton = divWrapper.querySelector('#createAccountButton');

  //event listener create account button
  createAccountButton.onclick = () => {
    createAccountPageView();
  };

  root.innerHTML = ''; // Clear current page rendering
  root.appendChild(divWrapper);
}
