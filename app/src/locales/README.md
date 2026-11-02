# Brazilian Portuguese deployment

The default deployment language is `pt-BR`. `en-US.json` is extracted from display positions in the
React source; `pt-BR.json` is its reviewed translation catalog. A Babel build plugin translates
visible JSX, accessible labels, display properties and message templates before the app is built.
It does not rewrite the DOM or translate user content, routes, identifiers, option values, types
or comparisons. Runtime templates preserve placeholder identity and expression evaluation order.
Date and number formatters without an explicit locale default to Brazilian regional formatting.

Regenerate source messages with `node scripts/extract-ui-messages.mjs`, update the Portuguese
catalog, then run `bun test app/tests/localization.test.ts` and build the app. An
`OPENBOT_DEFAULT_LOCALE=en-US` build can retain the original English interface.

The managed Bot browser defaults to `pt-BR`; `COMPUTER_LOCALE` can override that setting. Persistent
browser profiles and the Bot IDs are preserved when deploying the localized computer image.
