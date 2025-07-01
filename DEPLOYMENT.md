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
