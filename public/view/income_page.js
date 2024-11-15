import { handleIncomeFormSubmit, convertToMonthlyIncome } from '../controller/income_page_controller.js';
import { fetchIncomeSourceData, deleteIncomeSource, updateIncomeSource, fetchIncomeSourceDataById } from '../controller/firestore_controller.js';

let screenWidth = window.innerWidth;

export async function incomePageView() {
    const resp = await fetch('/view/templates/income_page_template.html',
        { cache: 'no-store' });

    const template = await resp.text();
    const root = document.getElementById('root');
    const div = document.createElement('div');
    div.innerHTML = template;
    root.innerHTML = '';
    root.classList.add('h-100');
    div.classList.add('h-100');
    root.appendChild(div);

    // Attach form submission to controller function
    document.querySelector('#incomeForm').onsubmit = handleIncomeFormSubmit;
    document.getElementById('incomeType').addEventListener('change', onChangeIncomeType);
    window.onresize = handleResize;


    await populateIncomeSourceTable();

    // Create chart
    await renderIncomeChart();
}

export async function renderIncomeChart() {
    // Fetch income data from the server
    const incomeData = await fetchIncomeSourceData();
    const labels = incomeData.map(incomeSource => incomeSource.name);
    const monthlyIncome = incomeData.map(incomeSource => incomeSource.monthlyIncome);

    const canvas = document.createElement('canvas');
    document.getElementById('incomeChart').parentElement.replaceChildren(canvas);
    canvas.id = 'incomeChart';

    // Create chart
    const ctx = document.getElementById('incomeChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '$',
                data: monthlyIncome,
                backgroundColor: [
                    '#ffc107',
                    '#dc3545',
                    '#0d6efd',
                    '#28a745',
                    '#6610f2',
                    '#6c757d',
                    '#0dcaf0',
                    '#fd7e14',
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            borderColor: 'rgba(0, 0, 0, 0)',
            borderJoinStyle: 'miter',
        }
    });
}

function onChangeIncomeType(event) {
    const incomeType = event.target.value;
    console.log(incomeType);
    const form = document.querySelector('#incomeForm');
    let existingElement = document.getElementById('incomeDetail') ?? null;
    const incomeDetailContainer = document.getElementById('incomeDetailContainer');

    // Remove existing element if it exists
    if (existingElement) {
        incomeDetailContainer.removeChild(existingElement);
    }

    // Add new element based on income type
    if (incomeType === 'Hourly') {
        const hourlyDetail = document.createElement('div');
        hourlyDetail.id = 'incomeDetail';
        hourlyDetail.innerHTML = `
            <div class="mb-3">
                <label for="hoursPerWeek" class="form-label">Hours Per Week</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fa-regular fa-clock"></i></span>
                    <input id="hoursPerWeek" class="form-control" name="incomeDetail" type="number" min="0" step="any">
                <div>
            </div>
        `;
        incomeDetailContainer.appendChild(hourlyDetail);
        document.querySelector('label[for="income"]').textContent = 'Income Per Hour';
    } else if (incomeType === 'Salary') {
        const oneTimeDetail = document.createElement('div');
        oneTimeDetail.id = 'incomeDetail';
        oneTimeDetail.innerHTML = `
            <div class="mb-3">
                <label for="incomeFrequency" class="form-label">Income Period</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fa-solid fa-calendar-days"></i></span>
                    <select id="incomeFrequency" name="incomeDetail" class="form-select">
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                <div>
            </div>
        `;
        incomeDetailContainer.appendChild(oneTimeDetail);
        document.querySelector('label[for="income"]').textContent = 'Income Per Period';
    } else {
        document.querySelector('label[for="income"]').textContent = 'Income';
    }
}

export async function populateIncomeSourceTable() {
    let totalIncome = 0;

    const incomeSourceTable = document.querySelector('#incomeSourceTable tbody');
    incomeSourceTable.innerHTML = '';
    const incomeSourceData = await fetchIncomeSourceData();
    incomeSourceData.forEach(incomeSource => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${incomeSource.name}</td>
            <td>${incomeSource.type}</td>
            <td>$${incomeSource.monthlyIncome}</td>
            <td>${(new Date(incomeSource.timestamp)).toLocaleDateString()}</td>
            <td class="d-flex align-items-center justify-content-end flex-wrap h-100">
            <button class="table-action btn btn-primary me-md-1 mb-1" data-id="${incomeSource.docId}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="table-action btn btn-danger me-md-1 mb-sm-1" data-id="${incomeSource.docId}"><i class="fa-regular fa-trash-can"></i></button>
            </td>
            `;
        incomeSourceTable.appendChild(row);
        totalIncome += Number(incomeSource.monthlyIncome);
    });
    document.querySelectorAll('.table-action.btn-danger').forEach(button => {
        button.onclick = handleDeleteIncomeButton;
    });
    document.querySelectorAll('.table-action.btn-primary').forEach(button => {
        button.onclick = handleEditIncomeButton;
    });

    document.getElementById('monthlyTotal').textContent = `Total: $${totalIncome}`;
}

async function handleDeleteIncomeButton(event) {
    const docId = event.currentTarget.getAttribute('data-id');
    await deleteIncomeSource(docId);
    await populateIncomeSourceTable();
    await renderIncomeChart();
}

async function handleEditIncomeButton(event) {
    const docId = event.currentTarget.getAttribute('data-id');
    const row = event.currentTarget.closest('tr');
    const cells = row.querySelectorAll('td');

    const name = cells[0].textContent;
    const type = cells[1].textContent;
    const income = cells[2].textContent.match(/\d+(\.\d+)?/)[0];

    cells[0].innerHTML = `<input type="text" value="${name}" class="form-control">`;
    const select = document.createElement('select');
    select.className = 'form-select';
    select.innerHTML = `
        <option value="hourly" ${type === 'Hourly' ? 'selected' : ''}>Hourly</option>
        <option value="salary" ${type === 'Salary' ? 'selected' : ''}>Salary</option>
        <option value="one-time" ${type === 'One-time' ? 'selected' : ''}>One-time</option>
    `;
    cells[1].innerHTML = '';
    cells[1].appendChild(select);
    cells[2].innerHTML = `<input type="number" value="${income}" class="form-control">`;

    const saveButton = document.createElement('button');
    saveButton.className = 'table-action btn btn-primary me-sm-1 mb-1';
    saveButton.innerHTML = '<i class="fa-regular fa-floppy-disk"></i>';
    saveButton.onclick = () => handleSaveIncomeButton(docId, row);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'table-action btn btn-secondary me-sm-1 mb-sm-1';
    cancelButton.innerHTML = '<i class="fa-solid fa-times"></i>';
    cancelButton.onclick = () => populateIncomeSourceTable();

    cells[4].classList.add('float-end', 'w-100');
    cells[4].innerHTML = '';
    cells[4].appendChild(saveButton);
    cells[4].appendChild(cancelButton);
    
}

async function handleSaveIncomeButton(docId, row) {
    const cells = row.querySelectorAll('td');
    const updatedName = cells[0].querySelector('input').value;
    const updatedType = cells[1].querySelector('select').value;
    const updatedIncome = cells[2].querySelector('input').value;

    const updatedData = {
        name: updatedName,
        type: updatedType,
        monthlyIncome: updatedIncome,
        timestamp: new Date().toISOString(),
    };

    await updateIncomeSource(docId, updatedData);
    await populateIncomeSourceTable();
    await renderIncomeChart();
}


async function handleResize() {
    // This prevents eroneous rerenders on mobile browsers
    if (window.innerWidth !== screenWidth && Math.abs(window.innerWidth - screenWidth) > 300) { 
        screenWidth = window.innerWidth;
        await renderIncomeChart();
    }
}

const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];