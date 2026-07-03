# Deploying Shopify Survey App to Vercel

This guide provides step-by-step instructions for deploying your Shopify Survey App to Vercel.

## Prerequisites

1.  **Shopify Partner Account**: You need an app created in the [Shopify Partner Dashboard](https://partners.shopify.com/).
2.  **PostgreSQL Database**: A hosted PostgreSQL instance (e.g., Vercel Postgres, Supabase, or Railway).
3.  **Vercel Account**: To host the Remix application.

## 1. Prepare Your Database

Ensure your PostgreSQL database is accessible. You will need the connection string (`DATABASE_URL`).

If using **Vercel Postgres**:
1.  Go to the "Storage" tab in your Vercel project.
2.  Create a new Postgres database.
3.  Vercel will automatically add the necessary environment variables.

## 2. Environment Variables

You must configure the following environment variables in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `SHOPIFY_API_KEY` | Your App's Client ID from the Partner Dashboard. |
| `SHOPIFY_API_SECRET` | Your App's Client Secret from the Partner Dashboard. |
| `SHOPIFY_APP_URL` | The URL of your Vercel deployment (e.g., `https://your-app.vercel.app`). |
| `SCOPES` | `write_products` (or any other scopes defined in `shopify.app.toml`). |
| `DATABASE_URL` | Your PostgreSQL connection string. |
| `APP_URL` | Same as `SHOPIFY_APP_URL`. |

## 3. Deploy to Vercel

1.  **Push your code** to a GitHub/GitLab/Bitbucket repository.
2.  **Import the project** into Vercel.
3.  In the **Build & Development Settings**:
    - Build Command: `npx prisma generate && npm run build`
    - Install Command: `npm install`
4.  Add the **Environment Variables** listed above.
5.  Click **Deploy**.

## 4. Configure Shopify Partner Dashboard

Once the deployment is finished and you have your Vercel URL (e.g., `https://my-survey-app.vercel.app`):

1.  Go to your app in the **Shopify Partner Dashboard**.
2.  Navigate to **App Setup**.
3.  Update **App URL**: `https://my-survey-app.vercel.app`
4.  Update **Allowed redirection URL(s)**:
    - `https://my-survey-app.vercel.app/auth/callback`
    - `https://my-survey-app.vercel.app/auth/shopify/callback`
5.  Update **App Proxy** (if applicable):
    - Subpath: `surveys`
    - Prefix: `apps`
    - Proxy URL: `https://my-survey-app.vercel.app/api`

## 5. Initialize the Database

Since Vercel is serverless, you need to run your migrations. You can do this locally by pointing your `DATABASE_URL` to the production database and running:

```bash
npx prisma migrate deploy
```

Alternatively, you can add `npx prisma migrate deploy` to your Vercel build command, but ensure your database user has sufficient permissions.

## Troubleshooting

-   **Session Storage**: This app uses Prisma for session storage. Ensure the `Session` table is created in your database.
-   **App Proxy**: If the survey widget doesn't load on the storefront, double-check that the App Proxy URL in Shopify matches your Vercel deployment and that the `SHOPIFY_APP_URL` is correct.
