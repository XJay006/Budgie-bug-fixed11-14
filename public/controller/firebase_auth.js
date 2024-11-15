import {
    getAuth, signInWithEmailAndPassword,
    onAuthStateChanged, signOut, createUserWithEmailAndPassword, updatePassword
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { app } from "./firebase_core.js";
import { DEV } from "../model/constants.js";
import { signinPageView } from "../view/signin_page.js";
import { navigateTo, routePathNames, routing } from "./route_controller.js";
import { userInfo } from "../view/elements.js";
import { homePageView } from "../view/home_page.js";
import { User } from "../model/User.js";
import { addUser } from "./firestore_controller.js";
import { showNotifications,addDummyNotification } from "../view/notification.js";

export let currentUser = null;


const auth = getAuth(app);

export async function signinFirebase(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Signed in:', user.email);
        // Optionally, you can redirect the user to the home page or another route here
        // navigateTo(e, '/');
        homePageView();
        alert('Sign-in successful!');
    } catch (error) {
        if (DEV) console.log('Sign-in error:', error);
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Sign-in error: ' + errorCode + ' ' + errorMessage);
    }
}


export async function createUserFirebase(e) {
    // Function to create a new user
    e.preventDefault();

    const fname = e.target.fname.value;
    const lname = e.target.lname.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const passwordConfirm = e.target.passwordConfirm.value;

    const userDB = new User({ fname, lname, email, password });
    let docId;
    if (password !== passwordConfirm) {
        alert('Passwords do not match!');
        return;
    } else {

        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log('Signed up:', user.email);
                try {
                    docId = await addUser(userDB);
                    // userDB.set_docId(docId);
                }
                catch (error) {
                    if (DEV) console.log('Create User Database error: ', error);
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert('Create User Database Error: ' + errorCode + ' ' + errorMessage);
                }
                navigateTo(e, routePathNames.INITIALIZEACCOUNT);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert('Sign-in error: ' + errorCode + ' ' + errorMessage);
            });
    }
}

export function attachAuthStateChangeObserver() {
    onAuthStateChanged(auth, authStateChangeListener);
}

function authStateChangeListener(user) {
    currentUser = user;
    if (user) {
        userInfo.textContent = user.email;
        const postAuth = document.getElementsByClassName('myclass-postauth');
        for (let i = 0; i < postAuth.length; i++) {
            postAuth[i].classList.replace('d-none', 'd-block');
        }
        const preAuth = document.getElementsByClassName('myclass-preauth');
        for (let i = 0; i < preAuth.length; i++) {
            preAuth[i].classList.replace('d-block', 'd-none');
        }
        // Disable Sign In and Create Account buttons
        disableAuthButtons();
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);
        //addDummyNotification();//for testing!!!!!!! delete later!!!!!!!
        console.log('User signed in:', user.email);
    } else {
        userInfo.textContent = 'No User';
        const postAuth = document.getElementsByClassName('myclass-postauth');
        for (let i = 0; i < postAuth.length; i++) {
            postAuth[i].classList.replace('d-block', 'd-none');
        }
        const preAuth = document.getElementsByClassName('myclass-preauth');
        for (let i = 0; i < preAuth.length; i++) {
            preAuth[i].classList.replace('d-none', 'd-block');
        }
        // Re-enable Sign In and Create Account buttons
        enableAuthButtons();
        history.pushState(null, null, routePathNames.SIGNIN || '/signin');
        signinPageView();
        console.log('User signed out');
    }
}

export async function updateToNewPassword(newPassword) {
    const user = auth.currentUser;
    updatePassword(user, newPassword).then(() => {
        console.log('Update Password SuccessFul');

    }).catch((error) => {
        console.error("Error updating password:", error);
        throw error;
    });
}

export async function signoutFirebase() {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
        await signOut(auth);

        // Show Sign In and Create Account buttons, hide Sign Out button
        enableAuthButtons();

        // Redirect to the sign-in page
        history.pushState(null, null, routePathNames.SIGNIN || '/signin');
        signinPageView();

        alert('User signed out successfully!');
    } else {
        console.log('Sign out cancelled');
    }
}

function disableAuthButtons() {
    const signinButton = document.getElementById('signinButton');
    const createAccountButton = document.getElementById('createAccountButton');
    const signoutButton = document.getElementById('signoutButton');

    if (signinButton) {
        signinButton.classList.add('d-none');  // Hide the Sign In button
    }

    if (createAccountButton) {
        createAccountButton.classList.add('d-none');  // Hide the Create Account button
    }

    if (signoutButton) {
        signoutButton.classList.remove('d-none');  // Show the Sign Out button
    }

     // Show notification button
     if (notificationButton) {
        notificationButton.style.display = 'inline-block';
    }

    // Load notifications
    showNotifications();
}



function enableAuthButtons() {
    const signinButton = document.getElementById('signinButton');
    const createAccountButton = document.getElementById('createAccountButton');
    const signoutButton = document.getElementById('signoutButton');

    if (signinButton) {
        signinButton.classList.remove('d-none');  // Show the Sign In button
    }

    if (createAccountButton) {
        createAccountButton.classList.remove('d-none');  // Show the Create Account button
    }

    if (signoutButton) {
        signoutButton.classList.add('d-none');  // Hide the Sign Out button
    }

    if (notificationButton) {
        notificationButton.style.display = 'none';
    }
    
    if (notificationContainer) {
        notificationContainer.classList.remove('show');
        notificationContainer.innerHTML = '';
    }
}

