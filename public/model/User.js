export class User {
    constructor(data, docId) {
        this.fname = data.fname;
        this.lname = data.lname;
        this.email = data.email;
        this.password = data.password;
        this.docId = docId;
    }

    set_docId(id) {
        this.docId = id;
    }

    toFirestore() {
        return {
            fname: this.fname,
            lname: this.lname,
            password: this.password,
            email: this.email,
        }
    }
}