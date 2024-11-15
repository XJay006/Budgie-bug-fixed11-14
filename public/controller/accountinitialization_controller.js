import { currentUser } from "./firebase_auth.js";
import { addInitailCategoryToFirebase, seedAverageMonthlyIncome } from "./firestore_controller.js";
import { navigateTo } from "./route_controller.js";



export function addCategoryForm(e) {
    e.preventDefault();
    console.log('Submitting Category');
    const newCategoryName = e.target.newcategoryName.value;

    let table = document.querySelector('table');
    let rows = table.querySelectorAll('tr');

    let template =
        `<td id="categoryName">${newCategoryName}</th><td><input id="budgetValue" type="number"></td><td><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editcategoryModal">Edit</button><button class="btn btn-danger">Delete</button></td>`;

    table.innerHTML += template;

}

export function deleteCategory(e) {
    e.preventDefault();
    console.log('Deleting Category');
    let row = e.target.parentElement.parentElement;
    row.remove();
}



export function editCategory(e) {
    e.preventDefault();
    console.log('Editing Category');
    let newName = window.prompt('Enter new name');
    if (newName == null || newName == "") {
        return;
    }
    let row = e.target.parentElement.parentElement;
    row.cells[0].textContent = newName;




}

export async function submitInitialInfo(e) {
    e.preventDefault();
    console.log('Submitting Info');
    let income = document.querySelector('input').value;
    let table = document.querySelector('table');
    let rows = table.querySelectorAll('tr');
    let email = currentUser.email;
    let amountSpent = 0;

    for (let row of table.rows) {
        if (row == table.rows[0]) {
            continue;
        }
        else {
            let categoryName = row.cells[0].textContent;
            let budgetValue = row.cells[1].firstChild.value;
            let categoryInfo = { email, categoryName, amountSpent, budgetValue };
            await addInitailCategoryToFirebase(categoryInfo);

        }
    }
    let name = "Inital Income";
    let incomeDetail = "monthly";
    let type = "salary";
    let monthlyIncome = income;
    const incomeSourceData = {
        user: currentUser.email,
        name,
        type,
        incomeDetail,
        income,
        monthlyIncome,
        timestamp: new Date().toISOString(),
    };




    await seedAverageMonthlyIncome(incomeSourceData);

    navigateTo(e, '/');

}