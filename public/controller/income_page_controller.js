import { currentUser } from "./firebase_auth.js";
import { addIncomeSource } from "./firestore_controller.js";
import { populateIncomeSourceTable, renderIncomeChart } from "../view/income_page.js";

export async function handleIncomeFormSubmit(event) {
    event.preventDefault();
    const type = event.target.incomeType.value;
    const income = event.target.income.value;
    const name = event.target.incomeName.value;
    let incomeDetail = null;
    if (type !== 'One-time') {
        incomeDetail = event.target.incomeDetail.value;
    }

    const monthlyIncome = convertToMonthlyIncome(type, incomeDetail, income);
    
    const incomeSourceData = {
        user: currentUser.email,
        name,
        type,
        incomeDetail,
        income,
        monthlyIncome,
        timestamp: new Date().toISOString(),
    };
    await addIncomeSource(incomeSourceData);
    await populateIncomeSourceTable();
    await renderIncomeChart();

    // Clear form fields
    event.target.reset();
}


// Mock data for demonstration
export async function fetchSavedIncomeData() {
    return {
        data: [50, 300, 100],
        labels: ['Salary', 'Hourly', 'One time income'],
        colors: [
            '#ffc107',
            '#dc3545',
            '#0d6efd',
            '#28a745'
        ],
    }; 
}

export function convertToMonthlyIncome(type, incomeDetail, income) {
    console.log(type, incomeDetail, income);
    let monthlyIncome = income;
    if (type === 'Hourly') {
        monthlyIncome = income * incomeDetail;
    } else if (type === 'Salary') {
        if (incomeDetail == 'Weekly') {
            monthlyIncome = income * 4;
        } else if (incomeDetail == 'Biweekly') {
            monthlyIncome = income * 2;
        } else if (incomeDetail == 'Monthly') {
            monthlyIncome = income;
        } else if (incomeDetail == 'Yearly') {
            monthlyIncome = income / 12;
        }
    }
    
    return Math.round(monthlyIncome);
}