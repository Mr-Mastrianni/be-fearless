# Deployment Guide for Courage Bot Adventure

This guide will walk you through deploying your React application to Vercel and connecting it to your GoDaddy domain.

## Deploying to Vercel

1. **Create a Vercel Account**:
   - Go to [vercel.com](https://vercel.com) and sign up for an account
   - You can sign up with GitHub for easier integration

2. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

3. **Deploy from GitHub**:
   - Push your code to GitHub if you haven't already
   - In Vercel dashboard, click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Environment Variables: Add all your environment variables from .env file
   - Click "Deploy"

4. **Deploy from Local** (alternative):
   - Run the following command in your project directory:
   ```bash
   vercel
   ```
   - Follow the prompts to configure your project
   - When asked about environment variables, add all the ones from your .env file

## Connecting Your GoDaddy Domain

1. **Add Your Domain in Vercel**:
   - In your Vercel project dashboard, go to "Settings" > "Domains"
   - Add your domain (e.g., `yourcouragebotsadventure.com`)
   - Vercel will provide you with nameserver or DNS records to configure

2. **Configure GoDaddy DNS**:
   - Log in to your GoDaddy account
   - Go to "My Products" > Your Domain > "DNS"
   - You have two options:
     
     **Option 1: Use Vercel nameservers (recommended)**
     - In GoDaddy, go to "Nameservers" and select "Change"
     - Select "Custom" and enter the Vercel nameservers provided in the Vercel dashboard
     - Usually these are:
       ```
       ns1.vercel-dns.com
       ns2.vercel-dns.com
       ```
     - Save changes

     **Option 2: Add DNS records**
     - In GoDaddy DNS management, add the records Vercel provides:
       - Add an A record pointing to Vercel's IP
       - Add CNAME records for www and any subdomains
     - Save changes

3. **Verify Domain**:
   - Back in Vercel, wait for domain verification to complete
   - This may take up to 48 hours for DNS changes to propagate, but often happens within an hour

## Environment Variables

Make sure to add all these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY` (be careful with this one, it has admin privileges)
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

## SSL/HTTPS

Vercel automatically provides SSL certificates for your domain, so your site will be served over HTTPS.

## Troubleshooting

- **Build Errors**: Check the build logs in Vercel for any errors
- **Domain Not Connecting**: Verify DNS settings and wait for propagation
- **API Errors**: Ensure environment variables are correctly set
- **CORS Issues**: Make sure your Supabase project allows your domain in the CORS settings

## Maintenance

- **Updates**: Push changes to your GitHub repository, and Vercel will automatically rebuild and deploy
- **Rollbacks**: In Vercel dashboard, you can view deployment history and roll back to previous versions if needed
