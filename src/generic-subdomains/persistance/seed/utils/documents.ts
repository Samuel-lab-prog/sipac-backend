/** Numeric, unique demonstration RG derived from the stable seed CPF. */
export function seedRg(cpf: string) {
	if (!/^99\d{9}$/.test(cpf))
		throw new Error('A seed document requires an 11-digit demonstration CPF.');
	return `8${cpf}`;
}
