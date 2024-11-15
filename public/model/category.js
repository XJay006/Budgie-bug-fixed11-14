export class Category {
    constructor(data) {
        this.docId = data.docId;
        this.email = data.email;
        this.name = data.name || data.categoryName;
        this.amountSpent = data.amountSpent || 0;
        this.amountBudgeted = data.amountBudgeted || 0;
        this.notificationThresholds = data.notificationThresholds || [80, 100];
        this.thresholdsNotified = data.thresholdsNotified || {};
    }

    setDocId(id) {
        this.docId = id;
    }

    toFireStore() {
        return {
            email: this.email,
            name: this.name,
            amountSpent: this.amountSpent,
            amountBudgeted: this.amountBudgeted,
            notificationThresholds: this.notificationThresholds,
            thresholdsNotified: this.thresholdsNotified,
        };
    }
}
