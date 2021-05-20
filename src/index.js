const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

app.post("/accounts", (req, res) => {
    const { cpf, name } = req.body;

    // It should not be able to create an account with the same cpf
    const accountAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if (accountAlreadyExists) {
        return res.status(400).json({
            error: "The account already exists."
        });
    }

    customers.push({
        id: uuidv4(),
        name,
        cpf,
        statement: []
    });

    return res.status(201).send();
});

app.get("/statements", (req, res) => {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: "Customer not found" });
    }

    return res.json(customer.statement);
});

app.listen(3333);