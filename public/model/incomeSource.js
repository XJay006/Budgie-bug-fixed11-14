class IncomeSource {
    constructor() {
        this.email = '';
        this.name = '';
        this.incomeType = '';
        this.incomeDetail = '';
        this.income = 0;
        this.timestamp = '';
    }

    setDocId(id) {
        this.docId = id;
    }

    toFirestore() {
        return {
            email: this.email,
            name: this.name,
            incomeType: this.incomeType,
            incomeDetail: this.incomeDetail,
            income: this.income,
            timestamp: this.timestamp
        };
    }
}