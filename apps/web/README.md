# PetRadar Web

## Social sign-in

PetRadar supports Google, LINE, and Facebook. Only providers with complete server configuration are shown on the login and registration pages.

### Google

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/clients), create a project, and configure the OAuth consent screen.
2. Create an OAuth client with application type **Web application**.
3. Add `http://localhost:3000` to **Authorized JavaScript origins**.
4. Copy the same client ID into:

```bash
# apps/web/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# apps/api/.env
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
```

### LINE

1. Open [LINE Developers Console](https://developers.line.biz/console/), create a provider, and create a **LINE Login** channel.
2. Enable **Web app**. PetRadar requests the standard `openid` and `profile` scopes, so LINE Login works without separate email permission.
3. Add this callback URL:

```text
http://localhost:4000/api/auth/line/callback
```

4. Add the channel values to `apps/api/.env`:

```bash
LINE_CHANNEL_ID="..."
LINE_CHANNEL_SECRET="..."
```

### Facebook

1. Open [Meta for Developers](https://developers.facebook.com/apps/), create a consumer app, and add **Facebook Login**.
2. Add this **Valid OAuth Redirect URI**:

```text
http://localhost:4000/api/auth/facebook/callback
```

3. Request `public_profile` and `email`, then add the app values to `apps/api/.env`:

```bash
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."
# Set this only when the Meta app requires an explicit Graph API version.
FACEBOOK_GRAPH_VERSION=""
```

### Shared server settings

```bash
WEB_ORIGIN="http://localhost:3000"
WEB_APP_URL="http://localhost:3000"
API_PUBLIC_URL="http://localhost:4000/api"
```

For a deployed environment, all origins and callbacks must use the real HTTPS domains and match the provider consoles exactly.

Apply the Prisma migration before starting the API:

```bash
npm exec --workspace apps/api prisma migrate deploy
```

Google ID tokens are verified by the API. LINE and Facebook use authorization-code callbacks followed by a hashed, two-minute, single-use PetRadar handoff token. Provider access tokens are never placed in browser URLs.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
