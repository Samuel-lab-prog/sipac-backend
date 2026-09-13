import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { UnprocessableEntityError } from '@DomainError';
export type DocumentSnapshot = {
	institution: string;
	campus: string;
	address: string;
	title: string;
	subjectName: string;
	paragraphs: string[];
	issuedAt: string;
	issuerName: string;
};
export async function renderDocument(snapshot: DocumentSnapshot, code: string) {
	const doc = await PDFDocument.create();
	const font = await doc.embedFont(StandardFonts.Helvetica),
		bold = await doc.embedFont(StandardFonts.HelveticaBold);
	doc.setTitle(snapshot.title);
	doc.setAuthor(snapshot.institution);
	doc.setCreationDate(new Date(snapshot.issuedAt));
	let page = doc.addPage([595.28, 841.89]),
		y = 785;
	const width = 483;
	function paragraph(value: string, size = 11, strong = false) {
		const face = strong ? bold : font;
		const input = value.replace(/[\r\n\t]+/g, ' ').normalize('NFC');
		try {
			face.encodeText(input);
		} catch {
			throw new UnprocessableEntityError(
				'O texto contém caracteres que o modelo de PDF ainda não suporta. Revise o cadastro antes de emitir.',
			);
		}
		const lines: string[] = [];
		let line = '';
		for (const char of input) {
			if (face.widthOfTextAtSize(line + char, size) > width) {
				const split = line.lastIndexOf(' ');
				if (split > 0) {
					lines.push(line.slice(0, split));
					line = line.slice(split + 1) + char;
				} else {
					lines.push(line);
					line = char;
				}
			} else line += char;
		}
		if (line) lines.push(line);
		for (const text of lines) {
			if (y < 65) {
				page = doc.addPage([595.28, 841.89]);
				y = 785;
			}
			page.drawText(text, {
				x: 56,
				y,
				size,
				font: face,
				color: rgb(0.12, 0.17, 0.22),
			});
			y -= size * 1.6;
		}
		y -= 15;
	}
	paragraph(snapshot.institution, 15, true);
	paragraph(snapshot.campus + ' · ' + snapshot.address, 10);
	y -= 15;
	paragraph(snapshot.title, 18, true);
	for (const text of snapshot.paragraphs) paragraph(text, 12);
	paragraph(
		'Emitido em ' +
			new Date(snapshot.issuedAt).toLocaleString('pt-BR', {
				timeZone: 'America/Sao_Paulo',
			}) +
			' (horário de Brasília).',
		10,
	);
	paragraph('Emissão registrada por: ' + snapshot.issuerName, 10);
	paragraph('Código de autenticidade: ' + code, 10, true);
	paragraph(
		'Consulte este código em Documentos > Validar documento no AGIAS da instituição. A consulta informa a situação atual e eventual revogação.',
		9,
	);
	paragraph(
		'Documento gerado pelo AGIAS. O código de autenticidade identifica este registro; não representa assinatura digital.',
		9,
	);
	addPageNumbers(doc, font);
	return doc.save();
}

function addPageNumbers(doc: PDFDocument, font: PDFFont) {
	const pages = doc.getPages();
	pages.forEach((p, i) =>
		p.drawText(`AGIAS · Modelo 1 · Página ${i + 1} de ${pages.length}`, {
			x: 56,
			y: 35,
			size: 8,
			font,
		}),
	);
}
