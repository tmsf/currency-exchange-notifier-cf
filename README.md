# ʕ •́؈•̀) `currency-exchange-notifier-cf`

a notification service using cloudflare workers, sendgrid api for sending emails, and fixer.io to fetch the currency rates

## Development

```bash
wrangler dev
```

```bash
curl  http://127.0.0.1:8787/
```

## Pushing to CF

```bash
wrangler publish
```

### Setting Enviromental variables 

You need to add the KEY as a global var for TS to pick it up

```ts
declare global {
  const <KEY>: string
}
```

to set it

```bash
wrangler secret put <KEY>
```