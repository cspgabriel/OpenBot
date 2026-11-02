import { readFileSync } from "node:fs";

const catalogPath = new URL("../src/locales/pt-BR.json", import.meta.url);
const uiProperties = new Set([
  "label",
  "title",
  "description",
  "placeholder",
  "tooltip",
  "subtitle",
  "message",
  "hint",
  "helpText",
  "emptyMessage",
  "loadingMessage",
  "errorMessage",
  "confirmLabel",
  "cancelLabel",
  "text",
  "note",
  "warning",
  "heading",
  "aria-label",
  "aria-description",
  "alt",
]);
const machineProperties = new Set([
  "id",
  "key",
  "type",
  "kind",
  "value",
  "name",
  "role",
  "className",
  "href",
  "to",
  "src",
  "variant",
  "size",
  "align",
  "side",
  "method",
  "path",
  "url",
  "event",
  "data-testid",
  "htmlFor",
  "target",
  "rel",
  "provider",
  "status",
  "state",
]);

// Match React's JSX whitespace handling before extracting a gettext-style message.
export function cleanText(value) {
  const lines = value.split(/\r\n|\n|\r/);
  let last = 0;
  lines.forEach((line, index) => {
    if (/[^ \t]/.test(line)) last = index;
  });
  return lines
    .map((line, index) => {
      let text = line.replace(/\t/g, " ");
      if (index !== 0) text = text.replace(/^ +/, "");
      if (index !== lines.length - 1) text = text.replace(/ +$/, "");
      return text ? text + (index !== last ? " " : "") : "";
    })
    .join("");
}

export function isMessage(value) {
  const text = value.trim();
  return (
    text.length > 1 &&
    /[A-Za-z]/.test(text) &&
    !/^(?:https?:|\/|\.|#|--|[a-z]+[._][a-z])/.test(text) &&
    (/\s/.test(text) ||
      /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(text) ||
      text === "AI")
  );
}

function propertyName(node) {
  return node?.name ?? node?.value;
}

// Only display positions are eligible. Routes, option values, discriminants, type
// literals and comparisons keep their original protocol values.
export function isDisplayPosition(path) {
  let current = path;
  while (current.parentPath) {
    const parent = current.parentPath;
    if (
      parent.isTSType?.() ||
      parent.isTSLiteralType?.() ||
      parent.isImportDeclaration() ||
      (parent.isExportNamedDeclaration() &&
        parent.node.source === current.node) ||
      parent.isBinaryExpression() ||
      parent.isSwitchCase() ||
      (parent.isMemberExpression() && parent.node.property === current.node)
    )
      return false;
    if (parent.isObjectProperty()) {
      if (parent.node.key === current.node) return false;
      const key = propertyName(parent.node.key);
      if (uiProperties.has(key)) return true;
      if (machineProperties.has(key)) return false;
    }
    if (parent.isJSXAttribute())
      return uiProperties.has(propertyName(parent.node.name));
    if (
      parent.isJSXExpressionContainer() &&
      !parent.parentPath?.isJSXAttribute()
    )
      return true;
    if (parent.isCallExpression()) {
      const callee = parent.node.callee;
      const name =
        callee.type === "Identifier" ? callee.name : callee.property?.name;
      if (
        /^(setError|setMessage|setNotice|setWarning|alert|confirm)$/.test(
          name ?? "",
        )
      )
        return true;
      if (callee.type === "MemberExpression" && callee.object?.name === "toast")
        return true;
      if (
        /^(fetch|includes|startsWith|endsWith|replace|replaceAll|split|test|match|import)$/.test(
          name ?? "",
        )
      )
        return false;
    }
    if (parent.isVariableDeclarator()) {
      const name = parent.node.id.name ?? "";
      if (
        /(?:label|title|description|message|placeholder|notice|warning|hint|subtitle|heading)/i.test(
          name,
        )
      )
        return true;
      return false;
    }
    if (parent.isReturnStatement()) {
      const fn = parent.getFunctionParent();
      const name = fn?.node.id?.name ?? fn?.parentPath?.node.id?.name ?? "";
      return /(?:label|title|description|message|notice|hint|summary|Text|Name)/.test(
        name,
      );
    }
    current = parent;
  }
  return false;
}

export default function localization(api, options = {}) {
  const t = api.types;
  const locale = options.locale ?? "pt-BR";
  let catalog = options.catalog;
  if (!catalog && !options.extract) {
    catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  }
  function translated(value, path, state) {
    const key = value.trim();
    if (!isMessage(key)) return null;
    if (options.extract) {
      options.extract.set(key, state.filename);
      return null;
    }
    if (locale !== "pt-BR" || typeof catalog?.[key] !== "string") return null;
    const slots = (text) =>
      [...text.matchAll(/\{\{\d+\}\}/g)]
        .map((match) => match[0])
        .sort()
        .join("|");
    if (slots(key) !== slots(catalog[key])) {
      throw path.buildCodeFrameError(
        `Translation placeholders differ for: ${key}`,
      );
    }
    return (
      value.slice(0, value.length - value.trimStart().length) +
      catalog[key] +
      value.slice(value.trimEnd().length)
    );
  }
  return {
    name: "openbot-localization",
    visitor: {
      Program: {
        enter(path, state) {
          state.formatIdentifier = null;
          state.program = path;
        },
        exit(path, state) {
          if (state.formatIdentifier) {
            path.unshiftContainer(
              "body",
              t.importDeclaration(
                [
                  t.importSpecifier(
                    state.formatIdentifier,
                    t.identifier("formatMessage"),
                  ),
                ],
                t.stringLiteral("@/lib/i18n"),
              ),
            );
          }
        },
      },
      JSXText(path, state) {
        const value = cleanText(path.node.value);
        const result = translated(value, path, state);
        if (result !== null)
          path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(result)));
      },
      StringLiteral(path, state) {
        if (!isDisplayPosition(path)) return;
        const result = translated(path.node.value, path, state);
        if (result === null) return;
        // Quoted JSX attributes do not interpret JavaScript's Unicode escapes.
        // An expression keeps accented characters intact through JSX generation.
        if (path.parentPath.isJSXAttribute()) {
          path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(result)));
        } else {
          path.node.value = result;
        }
      },
      TemplateLiteral: {
        exit(path, state) {
          if (!isDisplayPosition(path)) return;
          const key = path.node.quasis
            .map(
              (q, index) =>
                (q.value.cooked ?? q.value.raw) +
                (index < path.node.expressions.length ? `{{${index}}}` : ""),
            )
            .join("");
          const result = translated(key, path, state);
          if (result === null) return;
          state.formatIdentifier ??=
            state.program.scope.generateUidIdentifier("formatMessage");
          path.replaceWith(
            t.callExpression(state.formatIdentifier, [
              t.stringLiteral(result),
              t.arrayExpression(path.node.expressions),
            ]),
          );
          path.skip();
        },
      },
      CallExpression(path) {
        if (options.extract || locale !== "pt-BR") return;
        const callee = path.node.callee;
        const name =
          callee.type === "MemberExpression" ? callee.property?.name : null;
        const isLocaleMethod = [
          "toLocaleDateString",
          "toLocaleTimeString",
          "toLocaleString",
        ].includes(name);
        const isIntl =
          callee.type === "MemberExpression" &&
          callee.object?.name === "Intl" &&
          ["DateTimeFormat", "NumberFormat", "RelativeTimeFormat"].includes(
            name,
          );
        if (
          (isLocaleMethod || isIntl) &&
          (!path.node.arguments.length ||
            t.isIdentifier(path.node.arguments[0], { name: "undefined" }))
        ) {
          path.node.arguments[0] = t.stringLiteral(locale);
        }
      },
      NewExpression(path) {
        if (options.extract || locale !== "pt-BR") return;
        const callee = path.node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object?.name === "Intl" &&
          ["DateTimeFormat", "NumberFormat", "RelativeTimeFormat"].includes(
            callee.property?.name,
          ) &&
          (!path.node.arguments.length ||
            t.isIdentifier(path.node.arguments[0], { name: "undefined" }))
        ) {
          path.node.arguments[0] = t.stringLiteral(locale);
        }
      },
    },
  };
}
