const { response } = require("express");
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

function getBalance(statement) {
	return statement.reduce((acc, operation) => {
		if (operation.type === "credit") {
			return acc + operation.amount;
		} else {
			return acc - operation.amount;
		}
	}, 0);
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

app.post("/withdraw", (req, res) => {
	const { customer, body: { amount } } = req;

	const balance = getBalance(customer.statement);

	if (balance < amount) {
		return res.status(400).json({
			error: "You don't have sufficient funds"
		});
	}

	const statementOperation = {
		amount,
		created_at: new Date(),
		type: "debit",
	};

	customer.statement.push(statementOperation);

	return res.status(201).send();
});

app.get("/statements/date", (req, res) => {
	const { customer, query: { date } } = req;

	const dateFormat = new Date(date + " 00:00");

	const statement = customer.statement.filter((statement) =>
		statement.created_at.toDateString() ===
		new Date(dateFormat).toDateString());

	return res.json(statement);
});

app.put("/accounts", (req, res) => {
	const { name } = req.body;
	const { customer } = req;

	customer.name = name;
	return res.status(200).send();
});

app.get("/accounts", (req, res) => {
	const { customer } = req;

	return res.json(customer);
});

app.listen(3333);