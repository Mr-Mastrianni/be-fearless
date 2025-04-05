# GitHub Pages Deployment Guide

This guide explains how your website is deployed to GitHub Pages and how to maintain it.

## How the Deployment Works

Your website is deployed to GitHub Pages using the following process:

1. The `gh-pages` package is used to publish the contents of the `dist` directory to the `gh-pages` branch
2. GitHub Pages is configured to serve the content from the `gh-pages` branch
3. The `CNAME` file in the `public` directory ensures your custom domain is preserved during deployment

## Deployment Configuration

The following files are configured for GitHub Pages deployment:

### package.json

```json
{
  "name": "courage-bot-adventure",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "homepage": "https://becourageousnonprofit.org",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist --dotfiles"
  }
}
```

### vite.config.ts

```typescript
export default defineConfig(({ mode }) => ({
  base: '/courage-bot-adventure/',
  // other configuration...
}));
```

### src/App.tsx

```typescript
<BrowserRouter basename="/courage-bot-adventure" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  {/* App content */}
</BrowserRouter>
```

## How to Deploy Updates

When you make changes to your website, follow these steps to deploy the updates:

1. Make your changes to the code
2. Test your changes locally using `npm run dev`
3. When you're ready to deploy, run:

```bash
npm run deploy
```

This will:
- Build your project with the latest changes
- Deploy the built files to the gh-pages branch
- Update your GitHub Pages site

## Custom Domain Setup

Your website is configured to use a custom domain through the `CNAME` file in the `public` directory. This file contains:

```
couragebot.com
```

To set up your custom domain with GoDaddy, follow the instructions in the `GODADDY_SETUP.md` file.

## Troubleshooting

If you encounter issues with your deployment:

1. **404 Errors**: Make sure the `base` path in `vite.config.ts` and the `basename` in `BrowserRouter` match
2. **Missing Assets**: Check that all assets are referenced with relative paths
3. **Custom Domain Issues**: Verify your DNS settings in GoDaddy and the CNAME file in your repository

## GitHub Repository Settings

To check your GitHub Pages settings:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Verify that:
   - Source is set to "gh-pages" branch
   - Custom domain is set to your domain
   - "Enforce HTTPS" is checked (if available)

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [React Router with GitHub Pages](https://create-react-app.dev/docs/deployment/#notes-on-client-side-routing)
