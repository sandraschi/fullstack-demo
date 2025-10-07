// Deployment configuration for various platforms
export const deploymentConfig = {
  // Vercel deployment
  vercel: {
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install',
    framework: 'vite',
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html'
      }
    ]
  },
  
  // Netlify deployment
  netlify: {
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    installCommand: 'npm install',
    framework: 'vite',
    redirects: [
      {
        from: '/*',
        to: '/index.html',
        status: 200
      }
    ]
  },
  
  // GitHub Pages deployment
  githubPages: {
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    basePath: '/fullstack-demo', // Adjust for your repo name
    installCommand: 'npm install'
  },
  
  // Docker deployment
  docker: {
    baseImage: 'node:18-alpine',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    port: 3000,
    nginxConfig: {
      server: {
        listen: 3000,
        root: '/usr/share/nginx/html',
        index: 'index.html',
        location: {
          '/': {
            try_files: '$uri $uri/ /index.html'
          }
        }
      }
    }
  }
}

