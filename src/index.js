const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(req, res, next) {
	const { cpf } = req.headers;

	const customer = customers.find(customer => customer.cpf === cpf);

	if (!customer) {
		return res.status(400).json({ error: "Customer not found" });
	}

	req.customer = customer;

	return next();
}

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

app.use(verifyIfExistsAccountCPF);

app.get("/statements", (req, res) => {
	const { customer } = req;
	return res.json(customer.statement);
});

app.post("/deposits", (req, res) => {
	const { description, amount } = req.body;

	const { customer } = req;

	const statementOperation = {
		description,
		amount,
		created_at: new Date(),
		type: "credit",
	}

	customer.statement.push(statementOperation);

	return res.status(201).send();
});

app.listen(3333);