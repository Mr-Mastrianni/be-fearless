# Setting Up Your GoDaddy Domain with GitHub Pages

This guide will walk you through the process of connecting your GoDaddy domain to your GitHub Pages site.

## Step 1: Configure GitHub Pages for Your Custom Domain

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Scroll down to the "GitHub Pages" section
4. In the "Custom domain" field, enter your domain (e.g., `becourageousnonprofit.org`)
5. Click "Save"
6. Check the "Enforce HTTPS" option (this may take some time to become available after DNS propagation)

## Step 2: Configure Your GoDaddy DNS Settings

1. Log in to your GoDaddy account
2. Go to "My Products" > Your Domain > "DNS"
3. You need to add the following DNS records:

### A Records
Add these A records to point your apex domain (e.g., `couragebot.com`) to GitHub Pages:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | @    | 185.199.108.153 | 600 seconds (or 1 hour) |
| A    | @    | 185.199.109.153 | 600 seconds (or 1 hour) |
| A    | @    | 185.199.110.153 | 600 seconds (or 1 hour) |
| A    | @    | 185.199.111.153 | 600 seconds (or 1 hour) |

### CNAME Record
Add this CNAME record to point the `www` subdomain to your GitHub Pages site:

| Type  | Name | Value | TTL |
|-------|------|-------|-----|
| CNAME | www  | mr-mastrianni.github.io. | 600 seconds (or 1 hour) |

**Important**: Make sure to include the trailing dot (.) after github.io

## Step 3: Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally. Typically, it takes about 1-2 hours.

You can check the propagation status using tools like:
- https://www.whatsmydns.net/
- https://dnschecker.org/

## Step 4: Verify Your Setup

After DNS propagation is complete:

1. Visit your custom domain (e.g., `https://couragebot.com`)
2. Make sure your site loads correctly
3. Verify that HTTPS is working properly (look for the lock icon in your browser)

## Troubleshooting

If your site doesn't load correctly after 24 hours:

1. **Check DNS Configuration**: Verify that your DNS records are set up correctly in GoDaddy
2. **Check GitHub Pages Settings**: Make sure your custom domain is correctly set in GitHub Pages settings
3. **Check for HTTPS Issues**: If the site loads with HTTP but not HTTPS, wait a bit longer for the SSL certificate to be issued
4. **Clear Browser Cache**: Try accessing your site in an incognito/private browsing window

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GoDaddy DNS Help](https://www.godaddy.com/help/manage-dns-records-680)
