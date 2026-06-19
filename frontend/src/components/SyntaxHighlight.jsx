import React, { useMemo } from "react";

// ── Token definitions (order matters — first match wins) ─────────────────────
const TOKENS = [
  // Single-line comments
  { type: "comment",  re: /\/\/[^\n]*/g },
  { type: "comment",  re: /#[^\n]*/g },
  // Multi-line comments
  { type: "comment",  re: /\/\*[\s\S]*?\*\//g },
  { type: "comment",  re: /"""[\s\S]*?"""/g },
  { type: "comment",  re: /'''[\s\S]*?'''/g },
  // Template literals
  { type: "string",   re: /`(?:[^`\\]|\\.)*`/g },
  // Double-quoted strings
  { type: "string",   re: /"(?:[^"\\]|\\.)*"/g },
  // Single-quoted strings
  { type: "string",   re: /'(?:[^'\\]|\\.)*'/g },
  // Numbers (hex, float, int)
  { type: "number",   re: /\b(?:0x[\da-fA-F]+|0b[01]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*)\b/g },
  // Decorators / annotations
  { type: "decorator",re: /@[\w.]+/g },
  // Keywords
  { type: "keyword",  re: /\b(?:abstract|as|async|await|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|namespace|new|null|of|override|package|private|protected|public|readonly|return|set|static|super|switch|throw|try|type|typeof|undefined|var|void|while|with|yield|and|del|elif|except|exec|global|is|lambda|nonlocal|not|or|pass|print|raise|def|bool|byte|char|double|float|int|long|short|string|void|auto|extern|goto|include|inline|register|sizeof|struct|typedef|union|unsigned|signed|volatile|fn|let|mut|impl|trait|use|pub|mod|crate|self|Self|where|dyn|match|ref|move|box|loop|defer|go|chan|map|range|select|fallthrough|begin|end|do|then|until|unless|when|require|ensure|rescue|nil|true|false|True|False|None)\b/g },
  // Built-in types/objects
  { type: "type",     re: /\b(?:Array|Boolean|Date|Error|Function|Generator|Math|Number|Object|Promise|Proxy|Reflect|RegExp|Set|Map|String|Symbol|WeakMap|WeakRef|WeakSet|console|document|window|globalThis|process|Buffer|setTimeout|setInterval|clearTimeout|clearInterval|fetch|URL|URLSearchParams|FormData|Request|Response|Headers|AbortController|Event|EventTarget|HTMLElement|Element|Node|NodeList|Iterator|Iterable|AsyncIterator|AsyncIterable|ReadonlyArray|Record|Partial|Required|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|InstanceType|Parameters|ConstructorParameters|Awaited|int|str|list|dict|set|tuple|bytes|bytearray|memoryview|complex|frozenset|type|object|super|property|classmethod|staticmethod|zip|map|filter|enumerate|range|len|print|input|open|sorted|reversed|any|all|min|max|sum|abs|round|pow|divmod|bin|hex|oct|chr|ord|repr|hash|id|isinstance|issubclass|hasattr|getattr|setattr|delattr|vars|dir|iter|next|callable|format)\b/g },
  // Function/method declarations
  { type: "function", re: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g },
  // Operators
  { type: "operator", re: /(?:===|!==|==|!=|>=|<=|=>|->|::|&&|\|\||[+\-*/%&|^~!<>=?:]+)/g },
  // Punctuation (brackets, braces, parens, semicolons, commas)
  { type: "punctuation", re: /[{}[\]();,]/g },
];

const TOKEN_COLORS = {
  keyword:     "#c792ea",   // purple
  string:      "#c3e88d",   // soft green
  comment:     "#546e7a",   // muted blue-grey
  number:      "#f78c6c",   // peach
  type:        "#82aaff",   // blue
  function:    "#82aaff",   // blue (method calls)
  operator:    "#89ddff",   // cyan
  punctuation: "#89ddff",   // cyan
  decorator:   "#ffcb6b",   // amber
};

// Tokenize a line of code into segments
function tokenizeLine(line) {
  // Build flat list of { start, end, type } from all token regexes
  const marks = [];
  for (const { type, re } of TOKENS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      marks.push({ start: m.index, end: m.index + m[0].length, type });
    }
  }
  // Sort by start position; if tie, longer match wins
  marks.sort((a, b) => a.start - b.start || b.end - a.end);

  // Greedily pick non-overlapping tokens
  const picked = [];
  let cursor = 0;
  for (const mk of marks) {
    if (mk.start >= cursor) {
      picked.push(mk);
      cursor = mk.end;
    }
  }

  // Build segments: plain text interspersed with tokens
  const segments = [];
  let pos = 0;
  for (const { start, end, type } of picked) {
    if (pos < start) segments.push({ text: line.slice(pos, start), type: null });
    segments.push({ text: line.slice(start, end), type });
    pos = end;
  }
  if (pos < line.length) segments.push({ text: line.slice(pos), type: null });
  return segments;
}

/** Renders a <pre> block with IDE-style syntax highlighting */
export default function SyntaxHighlight({ code = "", className = "" }) {
  const lines = useMemo(() => {
    return code.split("\n").map((line, i) => ({
      num: i + 1,
      segments: tokenizeLine(line),
    }));
  }, [code]);

  return (
    <pre
      className={`syntax-block ${className}`}
      aria-label="Highlighted code"
    >
      {lines.map(({ num, segments }) => (
        <span key={num} className="code-line">
          <span className="line-num" aria-hidden>{String(num).padStart(3, " ")}</span>
          <span className="line-body">
            {segments.map((seg, si) =>
              seg.type ? (
                <span key={si} style={{ color: TOKEN_COLORS[seg.type] ?? "inherit" }}>
                  {seg.text}
                </span>
              ) : (
                <span key={si}>{seg.text}</span>
              )
            )}
          </span>
          {"\n"}
        </span>
      ))}
    </pre>
  );
}
