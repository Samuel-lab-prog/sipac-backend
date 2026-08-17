import { bold } from 'kleur/colors';
import { divider, section, padLeft, padRight } from './Utils';

export type TableColumn<Row> = {
	header: string;
	width: number;
	align?: 'left' | 'right';
	render: (row: Row) => {
		text: string;
		color?: (t: string) => string;
	};
};

const SEP = ' | ';

function pad(
	text: string,
	width: number,
	align: 'left' | 'right' = 'left',
): string {
	return align === 'right' ? padLeft(text, width) : padRight(text, width);
}

/**
 * Prints a formatted, fixed-width table to the console.
 *
 * The table supports:
 * - Custom column widths and alignment (left / right)
 * - Per-cell rendering logic
 * - Optional color formatting per cell
 * - A title section and a visual divider
 *
 * Each column is responsible for extracting and formatting its own value
 * through the `render` function, keeping presentation logic decoupled from
 * the row data structure.
 *
 * Notes:
 * - Column widths are fixed and **not** auto-calculated.
 * - Text longer than the column width is not truncated automatically.
 * - ANSI color functions do not affect layout width calculation.
 *
 * @template Row The shape of each row object
 *
 * @param title   Title printed above the table
 * @param columns Column definitions (header, width, alignment and renderer)
 * @param rows    Data rows to be rendered
 *
 * @example
 * printTable(
 *   'Users',
 *   [
 *     {
 *       header: 'ID',
 *       width: 4,
 *       align: 'right',
 *       render: (u) => ({ text: String(u.id) }),
 *     },
 *     {
 *       header: 'Name',
 *       width: 20,
 *       render: (u) => ({ text: u.name }),
 *     },
 *   ],
 *   users,
 * );
 */
export function printTable<Row>(
	title: string,
	columns: TableColumn<Row>[],
	rows: Row[],
): void {
	const totalWidth =
		columns.reduce((sum, c) => sum + c.width, 0) +
		SEP.length * (columns.length - 1);

	section(title);

	console.log(
		bold(columns.map((c) => pad(c.header, c.width, c.align)).join(SEP)),
	);

	console.log(divider('·', totalWidth));

	rows.forEach((row) => {
		console.log(
			columns
				.map((c) => {
					const { text, color } = c.render(row);
					const padded = pad(text, c.width, c.align);
					return color ? color(padded) : padded;
				})
				.join(SEP),
		);
	});
}
