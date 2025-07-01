# Frontend Deployment Guide

## Environment Variables for Production

Update the following file before deployment:

### `.env`

```
REACT_APP_API_URL=https://your-actual-backend-domain.onrender.com/api
```

## Deployment Steps

1. **Update API URL**: Replace `your-actual-backend-domain` with your actual backend URL
2. **Deploy to Render**: Connect your GitHub repository to Render
3. **Build Command**: `npm run build`
4. **Start Command**: `serve -s build`

## SPA Routing Fix for Render

To fix the refresh/direct URL issue with React Router on Render, the project includes:

1. **`_redirects` file**: Located in `public/_redirects` with content:

   ```
   /*    /index.html   200
   ```

2. **`404.html` file**: Located in `public/404.html` for fallback redirection

3. **`render.yaml`**: Optional configuration file for advanced Render settings

These files ensure that when users refresh the page or navigate directly to routes like `/dashboard`, the app will still work correctly.

## Auto-Deploy Configuration

The project is configured to automatically build and deploy when you push to your main branch.

### Build Configuration:

- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Node Version**: Auto-detected from package.json

### Environment Variables to Set in Render:

- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend-domain.onrender.com/api`)

## Notes

- The bundle size is optimized for production
- All Tailwind CSS references have been removed in favor of Ant Design
- API calls include proper error handling and token refresh
