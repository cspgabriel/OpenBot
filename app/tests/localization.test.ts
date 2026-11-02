import { describe, expect, it } from "bun:test";
import { transformSync } from "@babel/core";
import localization from "../plugins/localization.mjs";
import { formatMessage } from "../src/lib/i18n";

const catalog = {
  Computers: "Computadores",
  Computer: "Computador",
  "Close details": "Fechar detalhes",
  "Sign in to": "Entrar no",
  "Continue with {{0}} for {{1}}": "Para {{1}}, continuar com {{0}}",
};
function transform(source: string, locale = "pt-BR", customCatalog = catalog) {
  return (
    transformSync(source, {
      filename: "message.tsx",
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: ["typescript", "jsx"] },
      plugins: [[localization, { locale, catalog: customCatalog }]],
    })?.code ?? ""
  );
}

describe("deployment localization", () => {
  it("translates visible text and accessible labels while preserving protocol values", () => {
    const output = transform(`
      type Kind = "Computer";
      const kind: Kind = "Computer";
      const item = {value: "Computer", label: "Computer", id: "Computers"};
      const node = <a href="/admin/computers" aria-label="Close details">Computers</a>;
      const matches = kind === "Computer";
    `);
    expect(output).toContain('label: "Computador"');
    expect(output).toContain('value: "Computer"');
    expect(output).toContain('id: "Computers"');
    expect(output).toContain('href="/admin/computers"');
    expect(output).toContain('aria-label={"Fechar detalhes"}');
    expect(output).toContain('{"Computadores"}');
    expect(output).toContain('kind === "Computer"');
    expect(output).toContain('type Kind = "Computer"');
  });

  it("uses expressions for accented JSX attributes and formats dates inside messages", () => {
    const output = transform(
      '<Page title="Computers">{`Continue with ${date.toLocaleTimeString()} for ${person}`}</Page>',
      "pt-BR",
      { ...catalog, Computers: "Configuração" },
    );
    expect(output).toContain('title={"Configura');
    expect(output).toContain('toLocaleTimeString("pt-BR")');
  });

  it("keeps the separator before a dynamic product name", () => {
    expect(transform("<h1>Sign in to {productName}</h1>")).toContain(
      '"Entrar no "',
    );
  });

  it("keeps expression evaluation order when Portuguese reorders placeholders", () => {
    const output = transform(
      "const node = <span>{`Continue with ${provider()} for ${person()}`}</span>;",
    );
    expect(output).toContain(
      '"Para {{1}}, continuar com {{0}}", [provider(), person()]',
    );
    expect(
      formatMessage("Para {{1}}, continuar com {{0}}", ["Google", "Gabriel"]),
    ).toBe("Para Gabriel, continuar com Google");
  });

  it("rejects a catalog entry that drops a template value", () => {
    expect(() =>
      transform(
        "const node = <span>{`Continue with ${provider()} for ${person()}`}</span>;",
        "pt-BR",
        { ...catalog, "Continue with {{0}} for {{1}}": "Continuar com {{0}}" },
      ),
    ).toThrow("Translation placeholders differ");
  });

  it("uses Brazilian regional formatting without replacing an explicit locale", () => {
    const output = transform(`
      const first = date.toLocaleDateString();
      const second = new Intl.RelativeTimeFormat(undefined, {numeric: "auto"});
      const third = date.toLocaleString("ja-JP");
    `);
    expect(output).toContain('toLocaleDateString("pt-BR")');
    expect(output).toContain('RelativeTimeFormat("pt-BR"');
    expect(output).toContain('toLocaleString("ja-JP")');
  });

  it("leaves the English source available for an English build", () => {
    expect(transform("const node = <h1>Computers</h1>;", "en-US")).toContain(
      "Computers</h1>",
    );
  });
});
