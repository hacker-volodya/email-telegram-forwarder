# Email -> Telegram Forwarder (Cloudflare Email Worker)

## Usage
1. Set up github actions secrets, CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID: 
> `CLOUDFLARE_API_TOKEN`: Cloudflare -> Profile -> API Tokens -> Create Token -> Use template "Edit Cloudflare Workers" -> Select "Account Resources" and "Zone Resources"

> `CLOUDFLARE_ACCOUNT_ID`: do not set if you have only one cloudflare account, otherwise go to domain settings and get account id from url (`https://dash.cloudflare.com/<your_account_id>/<your_domain>`).
2. Run `deploy` workflow.
3. Set up `BOT_TOKEN` and `CHAT_ID` secrets in Cloudflare dashboard (Cloudflare -> Workers & Pages -> email-telegram-forwarder -> Settings -> Variables).
4. Route your email addresses to worker `email-telegram-forwarder` (Cloudflare -> your domain settings -> Email -> Email Routing -> Routing rules -> Create address).