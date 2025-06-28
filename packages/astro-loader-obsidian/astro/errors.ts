import type { YAMLException } from "js-yaml";

interface ErrorProperties {
  title?: string;
  name: string;
  message?: string;
  location?: ErrorLocation;
  hint?: string;
  stack?: string;
  frame?: string;
}

export interface ErrorLocation {
  file?: string;
  line?: number;
  column?: number;
}

type ErrorTypes =
  | "AstroError"
  | "AstroUserError"
  | "CompilerError"
  | "CSSError"
  | "MarkdownError"
  | "InternalError"
  | "AggregateError";

function normalizeLF(code: string) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}

/** Generate a code frame from string and an error location */
function codeFrame(src: string, loc: ErrorLocation): string {
  if (!loc || loc.line === undefined || loc.column === undefined) {
    return "";
  }
  const lines = normalizeLF(src)
    .split("\n")
    .map((ln) => ln.replace(/\t/g, "  "));
  // grab 2 lines before, and 3 lines after focused line
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n]) visibleLines.push(loc.line + n);
  }
  // figure out gutter width
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    const w = `> ${lineNo}`;
    if (w.length > gutterWidth) gutterWidth = w.length;
  }
  // print lines
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}\n`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(
        " "
      )}  | ${Array.from({
        length: loc.column,
      }).join(" ")}^\n`;
  }
  return output;
}

export class AstroError extends Error {
  public loc: ErrorLocation | undefined;
  public title: string | undefined;
  public hint: string | undefined;
  public frame: string | undefined;

  type: ErrorTypes = "AstroError";

  constructor(props: ErrorProperties) {
    const { name, title, message, stack, location, hint, frame } = props;
    super(message);

    this.title = title;
    this.name = name;

    if (message) this.message = message;
    // Only set this if we actually have a stack passed, otherwise uses Error's
    this.stack = stack ? stack : (this.stack as string);
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }

  public setLocation(location: ErrorLocation): void {
    this.loc = location;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setMessage(message: string): void {
    this.message = message;
  }

  public setHint(hint: string): void {
    this.hint = hint;
  }

  public setFrame(source: string, location: ErrorLocation): void {
    this.frame = codeFrame(source, location);
  }

  static is(err: unknown): err is AstroError {
    return (err as AstroError).type === "AstroError";
  }
}

export class MarkdownError extends AstroError {
  override type: ErrorTypes = "MarkdownError";

  static override is(err: unknown): err is MarkdownError {
    return (err as MarkdownError).type === "MarkdownError";
  }
}

export function isYAMLException(err: unknown): err is YAMLException {
  return err instanceof Error && err.name === "YAMLException";
}
