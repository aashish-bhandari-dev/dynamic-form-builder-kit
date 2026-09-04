/**
 * Lightweight, zero-dependency ANSI color helpers for terminal output.
 */
const isColorSupported =
    !process.env.NO_COLOR &&
    (process.env.FORCE_COLOR || (process.stdout && process.stdout.isTTY));

function color(open: number, close: number) {
    return (str: string | number): string => {
        if (!isColorSupported) return String(str);
        return `\x1b[${open}m${str}\x1b[${close}m`;
    };
}

export const colors = {
    bold: color(1, 22),
    dim: color(2, 22),
    italic: color(3, 23),
    underline: color(4, 24),
    black: color(30, 39),
    red: color(31, 39),
    green: color(32, 39),
    yellow: color(33, 39),
    blue: color(34, 39),
    magenta: color(35, 39),
    cyan: color(36, 39),
    white: color(37, 39),
    gray: color(90, 39),
};
