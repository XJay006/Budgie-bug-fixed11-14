import { renderExpenses } from "../view/expense_page.js";
import { addExpenseSource, deleteExpenseSource, fetchExpenseSourceData, updateExpenseInFirestore } from "./firestore_controller.js";
import { currentUser } from "./firebase_auth.js";
import { checkAndCreateNotifications } from "./notification_controller.js";
import { getUserInfo } from './firestore_controller.js';
import {
    getFirestore,
    doc,
    updateDoc,
    increment,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"
import { app } from "./firebase_core.js";

const userCollection = 'expenseSource';
const db = getFirestore(app);

export async function handleExpenseFormSubmit(event) {
    event.preventDefault();
    console.log('Form submitted');

    // Get the form
    const form = event.target;

    // Get the expense type
    const expenseType = form.querySelector('#expenseType').value;
    if (expenseType === 'expense') {
        alert('Please enter an expense type');
        return;
    }

    // Get category
    const categoryId = form.querySelector('#categorySelect').value
    if (categoryId === '') {
        alert('Please enter a category')
        return;
    }

    // Get description
    const description = form.querySelector("#description").value
    if (description === '') {
        alert('Please enter a description')
        return;
    }

    // Get date
    const date = form.querySelector("#date").value
    if (date === '' || date === null) {
        alert('Please enter a date')
        return;
    }

    // Get total expense
    const totalExpenseStr = form.querySelector('#expense').value;
    const totalExpense = parseFloat(totalExpenseStr);
    if (isNaN(totalExpense) || totalExpense <= 0) {
        alert('Please enter a valid expense amount');
        return;
    }

    // select row so we can insert elements
    // const parentElement = form.parentNode;
    // const expenseTableBody = parentElement.querySelector('#expenseTableBody');
    // console.log(expenseTableBody);

    // //create new row
    // const newRow = document.createElement('tr');
    // newRow.innerHTML = `
    //     <td>${expenseType}</td>
    //     <td>${'$'+totalExpense}</td>
    //     <td>
    //         <button class="btn btn-danger">Delete</button>
    //     </td>
    // `;

    const expenseSourceData = {
        user: currentUser.email,
        expenseType: expenseType,
        categoryId: categoryId,
        description: description,
        date: date,
        totalExpense: totalExpense,
        timestamp: new Date().toISOString(),
    };

    await addExpenseSource(expenseSourceData);

    // Update amountSpent in the category
    await updateAmountSpent(categoryId, totalExpense);

    // Check and create notifications if necessary
    await checkAndCreateNotifications(categoryId);

    //await rerenderexpenses

    // Add event listener to the delete button
    //  const deleteButton = newRow.querySelector('.btn-danger');
    //  deleteButton.addEventListener('click', function() {
    //     expenseTableBody.removeChild(newRow);
    //  });
    // expenseTableBody.appendChild(newRow);

    window.location.reload();
}

// Mock data for demonstration
export async function fetchSavedExpenseChartData() {

    // weekly = 52*expense
    // monthly = 12*expense
    // one time = expense
    // const table = document.getElementById('expenseTableForm');


    return {
        data: [50, 300, 100],
        labels: ['Weekly', 'Monthly', 'One time expense'],
        colors: [
            '#ffc107',
            '#dc3545',
            '#0d6efd',
            '#28a745'
        ],
    };
}

export async function fetchSavedExpenseData() {
    const expenseData = await fetchExpenseSourceData();
    return expenseData;
}

export async function deleteExpense(id) {
    await deleteExpenseSource(id);
    await renderExpenses();
}

export async function editExpense(docId, update) {
    await updateExpenseInFirestore(docId, update);
    await renderExpenses();
}

export function convertToMonthlyExpense(type, expenseDetail, expense) {
    console.log(type, expenseDetail, expense);
    let monthlyExpense = expense;
    if (type === 'Weekly') {
        monthlyExpense = expense * 4;
    }

    return Math.round(monthlyExpense);
}
/*
export async function updateAmountSpent(categoryId, amount) {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
        amountSpent: increment(amount),
    });
}
*/

/*export async function updateAmountSpent(categoryId, amount) {
    const amountNumber = typeof amount === 'number' ? amount : parseFloat(amount);
    console.log(`Updating amountSpent for category ${categoryId} by amount ${amountNumber}`);
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
        amountSpent: increment(amountNumber),
    });
}
*/
export async function updateAmountSpent(categoryId, amount) {
    console.log(`Updating amountSpent for category ${categoryId} by amount ${amount}`);
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
        amountSpent: increment(amount)
    });
}