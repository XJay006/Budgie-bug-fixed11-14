
import { fetchUserCategories, addInitailCategoryToFirebase } from '../controller/firestore_controller.js';
import { handleExpenseFormSubmit, fetchSavedExpenseChartData, fetchSavedExpenseData, deleteExpense, editExpense } from '../controller/expenses_page_controller.js';
import { protectedView } from "./protected_view.js";
import { currentUser } from "../controller/firebase_auth.js";
export async function expensePageView() {
    const resp = await fetch('/view/templates/expense_page_template.html',
        { cache: 'no-store' });

    const template = await resp.text();
    const root = document.getElementById('root');
    const div = document.createElement('div');
    div.innerHTML = template;
    root.innerHTML = '';
    root.classList.add('h-100');
    div.classList.add('h-100');
    root.appendChild(div);

    if (!currentUser) {
        root.innerHTML = await protectedView();
        return;
    }

    // Attach form submission to controller function
    document.querySelector('#expenseForm').onsubmit = handleExpenseFormSubmit;

    // Add new custom category 
    const submitCustomCategoryButton = document.getElementById('submitCustomCategory');
    submitCustomCategoryButton.removeEventListener('click', handleCustomCategorySubmit);
    submitCustomCategoryButton.addEventListener('click', handleCustomCategorySubmit);

    await populateCategories();
    // Create chart
    await renderExpenses();
}

async function populateCategories() {
    const categories = await fetchUserCategories();
    const categorySelect = document.getElementById('categorySelect'); // Correct ID
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.docId; // Use category.docId as the value
        option.textContent = category.name; // Use 'name' property consistently
        categorySelect.appendChild(option);
    });
}

async function handleCustomCategorySubmit(event) {
    event.preventDefault();
    const categoryName = document.getElementById('newcategoryName').value;
    const amountSpent = 0;
    const budgetValue = 0;
    const email = currentUser.email;
    let categoryInfo = { email, categoryName, amountSpent, budgetValue };
    console.log("curr user: ", categoryInfo);
    await addInitailCategoryToFirebase(categoryInfo);
    window.location.reload();
}

export async function renderExpenses() {

    // const submitCustomCategoryButton = document.getElementById('submitCustomCategory');
    // submitCustomCategoryButton.addEventListener('click', async (event) => {
    //     console.log("cc");
    //     event.preventDefault(); // Prevent form from submitting to server
    //     const categoryName = document.getElementById('newcategoryName').value;
    //     const amountSpent = 0;
    //     const budgetValue = 0;
    //     const email = currentUser.email;
    //     let categoryInfo = { email, categoryName, amountSpent, budgetValue };
    //     console.log("curr user: ", categoryInfo);
    //     await addInitailCategoryToFirebase(categoryInfo);
    // });

    // Fetch income data from the server
    const expenseData = await fetchSavedExpenseData();
    const expenseChartData = await fetchSavedExpenseChartData();

    console.log(expenseData);

    //select row so we can insert elements
    const expenseTableBody = document.querySelector('#expenseTableBody');
    console.log(expenseTableBody);

    const categories = await fetchUserCategories();
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.docId] = cat.name;
    });

    //delete all previous entries
    // expenseTableBody.innerHTML = '';

    // Loop through expense data and create rows
    // expenseData.forEach(expense => {
    //     const newRow = document.createElement('tr');

    //     newRow.innerHTML = 
    //         <td>${expense.expenseType}</td>
    //         <td>${'$' + expense.totalExpense}</td>
    //         <td>
    //             <button class="btn btn-danger" id="${expense.docId}">Delete</button>
    //         </td>
    //     ;
    //     // Add event listener to the delete button
    //     const deleteButton = newRow.querySelector('.btn-danger');
    //     deleteButton.addEventListener('click', async function () {
    //         console.log(expense.docId);
    //         await deleteExpense(deleteButton.id);
    //     });

    //     //finally append built row to list
    //     expenseTableBody.appendChild(newRow);
    // });

    const categoryTable = document.getElementById('categoryTable');
    categoryTable.innerHTML = `
    <thead>
        <tr>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Type</th>
            <th scope="col">Amount</th>
            <th scope="col">Action</th>
        </tr>
    </thead>
    <tbody id="categoryTableBody"></tbody>
    `
        ;

    const categoryTableBody = document.getElementById('categoryTableBody');

    // Loop through each category and create a new row
    expenseData.forEach(category => {
        const newRow = document.createElement('tr');
    
        // Get the category name from the categoryMap using categoryId
        const categoryName = categoryMap[category.categoryId] || 'Unknown';
    
        newRow.innerHTML = `
            <td data-field="Date">${category.date}</td>
            <td data-field="category">${categoryName}</td>
            <td data-field="Description">${category.description}</td>
            <td data-field="Type">${category.expenseType}</td>
            <td data-field="Amount">${'$' + category.totalExpense}</td>
            <td data-field="Actions">
                <button class="btn btn-primary">Edit</button>
                <button class="btn btn-danger" id="${category.docId}">Delete</button>
            </td>
        `;

        // Delete button (deletes entire entry for selected expense)
        const deleteButton = newRow.querySelector('.btn-danger');
        deleteButton.addEventListener('click', async function () {
            console.log(expense.docId);
            await deleteExpense(deleteButton.id); // Define this function to handle category deletion
            window.location.reload();
        });

        // // Update button 
        // const updateButton = newRow.querySelector('.btn-success');
        // updateButton.addEventListener('click', async function () {
        //     const row = updateButton.closest('tr');
        //     const updatedCategory = row.querySelector('input[name="category"]').value;
        //     const update = {
        //         category: updatedCategory,
        //         //add more items as needed
        //     };
        //     await editExpense(category.docId, update)
        //     window.location.reload();
        // })

        // Edit button
        const editButton = newRow.querySelector('.btn-primary');
        editButton.addEventListener('click', async function () {
            // Replace text with input fields
            //<input type="text" id="category" name="category" value="${category.category}"
            const originalCategory = category.category;

            //remove edit button and delete button and replace with save/cancel buttons
            editButton.remove();
            deleteButton.remove();
            const saveButton = document.createElement('button');
            saveButton.className = 'btn btn-warning';
            saveButton.innerHTML = 'Save';
            newRow.querySelector('[data-field="Actions"]').appendChild(saveButton);

            const type = category.expenseType;

            const amountInputsHtml = `<input type="text" id="category" name="Amount" value="${category.totalExpense}">`;
            const descriptionInputsHtml = `<input type="text" id="description" name="description" value="${category.description}">`;
            const typeInputsHtml = document.createElement('select');
            typeInputsHtml.className = 'form-select';
            typeInputsHtml.innerHTML = `<option value="Weekly" ${type === 'Weekly' ? 'selected' : ''}>Weekly</option>
                                        <option value="Monthly" ${type === 'Monthly' ? 'selected' : ''}>Monthly</option>
                                        <option value="One time expense" ${type === 'One time expense' ? 'selected' : ''}>One-time</option>`;
            typeInputsHtml.selectedIndex = type;
            const categoryInputsHtml = `<input type="text" id="category" name="category" value="${category.category}">`;
            const dateInputsHtml = `<input type="date" id="date" name="date" value="${category.date}">`;

            // Update the inner HTML of the editable cells
            const amountCell = newRow.querySelector('[data-field="Amount"]');
            const descriptionCell = newRow.querySelector('[data-field="Description"]');
            const typeCell = newRow.querySelector('[data-field="Type"]');
            const actionCell = newRow.querySelector('[data-field="Actions"]');
            const categoryCell = newRow.querySelector('[data-field="category"]');
            const dateCell = newRow.querySelector('[data-field="Date"]');

            amountCell.innerHTML = amountInputsHtml.split('</input>').join('</input > ');
            descriptionCell.innerHTML = descriptionInputsHtml.split('</input>').join('</input > ');
            typeCell.innerHTML = '';
            typeCell.appendChild(typeInputsHtml);
            categoryCell.innerHTML = categoryInputsHtml.split('</input>').join('</input > ');
            dateCell.innteHTML = '';
            dateCell.class = "form-control";
            dateCell.id = "date";
            dateCell.type = "date";
            dateCell.name = "date";
            dateCell.value = category.date;
            dateCell.innerHTML = dateInputsHtml.split('</input>').join('</input > ');



            // Cancel button
            // Store the original category value
            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn btn-secondary';
            cancelButton.innerHTML = 'Cancel';
            cancelButton.addEventListener('click', async function () {
                // Revert back to the original values
                renderExpenses();
            });
            actionCell.appendChild(cancelButton);

            //save button
            saveButton.addEventListener('click', async function () {
                const updatedCategory = newRow.querySelector('input[name="category"]').value;
                const updatedDescription = newRow.querySelector('input[name="description"]').value;
                const updatedType = newRow.querySelector('select').value;
                const updatedAmount = newRow.querySelector('input[name="Amount"]').value;
                const updatedDate = newRow.querySelector('input[name="date"]').value;
                const update = {
                    date: updatedDate,
                    category: updatedCategory,
                    description: updatedDescription,
                    expenseType: updatedType,
                    totalExpense: updatedAmount
                };
                await editExpense(category.docId, update);
                renderExpenses();
            });
            
        });



        // Append the row to the table body
        categoryTableBody.appendChild(newRow);
    });

    //fill in rows with data from firebase

    // Create chart

    //check if we have data before rendering the chart.
    //if we don't have data, we don't want to render the chart

    // const theTable = document.getElementById('expenseTableBody');
    // if (theTable.rows.length === 0) {
    //     return;
    // }

    // const ctx = document.getElementById('expenseChart');
    // new Chart(ctx, {
    //     type: 'pie',
    //     data: {
    //         labels: expenseChartData.labels,
    //         datasets: [{
    //             label: '$',
    //             data: expenseChartData.data,
    //             backgroundColor: expenseChartData.colors,
    //             hoverOffset: 4
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         borderColor: 'rgba(0, 0, 0, 0)',
    //         borderJoinStyle: 'miter',
    //     }
    // });
}