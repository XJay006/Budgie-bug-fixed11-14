import { renderIncomeChart } from "./income_page.js";
import { fetchExpenseSourceData, fetchIncomeSourceData } from "../controller/firestore_controller.js";

export async function homePageView() {
    const resp = await fetch('/view/templates/home_page_template.html', { cache: 'no-store' });
    const template = await resp.text();
    const root = document.getElementById('root');
    const div = document.createElement('div');
    div.innerHTML = template;
    root.innerHTML = '';
    root.appendChild(div);

    const incomeData = await fetchIncomeSourceData();
    const expenseData = await fetchExpenseSourceData();
    await populateTotals(incomeData, expenseData);

    await populateRecentTransactions(incomeData, expenseData);

    await renderIncomeChart(incomeData);   
    await renderExpensesChart(expenseData);

}

async function populateRecentTransactions(incomeData, expenseData) {
    const recentTransactionsTable = document.querySelector('#recentTransactionsTable tbody');
    recentTransactionsTable.innerHTML = '';

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentIncome = incomeData.filter(income => new Date(income.timestamp) >= oneWeekAgo);
    const recentExpenses = expenseData.filter(expense => new Date(expense.timestamp) >= oneWeekAgo);

    const recentTransactions = [...recentIncome, ...recentExpenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const textClass = transaction.income ? 'text-success' : 'text-danger';
        row.innerHTML = `
            <td class="${textClass}">${transaction.name || transaction.description}</td>
            <td class="${textClass}">${transaction.income ? 'Income' : 'Expense'}</td>
            <td class="${textClass}">${transaction.income ? `$${transaction.income}` : `$${transaction.totalExpense}`}</td>
            <td class="${textClass}">${transaction.type || transaction.category}</td>
            <td class="${textClass}">${new Date(transaction.timestamp).toLocaleDateString()}</td>
        `;
        recentTransactionsTable.appendChild(row);
    });
}

export async function populateTotals(incomeData, expenseData) {
    const totalIncome = incomeData.reduce((total, incomeSource) => Number(total) + Number(incomeSource.monthlyIncome), 0);
    document.getElementById('homeIncomeTotal').innerText = `Income: $${totalIncome}`;

    const totalExpenses = expenseData.reduce((total, expenseSource) => Number(total) + Number(expenseSource.totalExpense), 0);
    document.getElementById('homeExpensesTotal').innerText = `Expenses: $${totalExpenses}`;

    const netIncome = totalIncome - totalExpenses; 
    if (netIncome < 0) {
        document.getElementById('netMoney').innerText = `Net Income: -$${Math.abs(netIncome)}`;
        document.getElementById('netMoney').classList.add('text-danger');
    } else {
        document.getElementById('netMoney').innerText = `Net Income: $${netIncome}`;
        document.getElementById('netMoney').classList.add('text-success');
    }
}

// This is a placeholder for when the expenses chart is complete
export async function renderExpensesChart(expenseData) {
    // Fetch income data from the server
    // const expenseData = await fetchExpenseSourceData();

    const canvas = document.createElement('canvas');
    document.getElementById('expensesChart').parentElement.replaceChildren(canvas);
    canvas.id = 'expensesChart';

    // Group expenses by category
    const groupedExpenses = expenseData.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.totalExpense;
        return acc;
    }, {});

    // Extract labels and aggregated expenses
    const labels = Object.keys(groupedExpenses);
    const monthlyExpenses = Object.values(groupedExpenses);

    // Create chart
    const ctx = document.getElementById('expensesChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '$',
                data: monthlyExpenses,
                backgroundColor: [
                    '#fd7e14',
                    '#0dcaf0',
                    '#6c757d',
                    '#6610f2',
                    '#ffc107',
                    '#28a745',
                    '#0d6efd',
                    '#dc3545',
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