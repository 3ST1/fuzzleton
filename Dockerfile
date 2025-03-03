# ---- Builder Stage ----
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Install Git and Git LFS
    RUN apk add --no-cache git git-lfs \
        && git lfs install --skip-repo
    
    # Copy package files and install dependencies
    COPY package.json package-lock.json ./
    RUN npm install --frozen-lockfile
    
    # Copy the rest of the code and build
    COPY . .
    RUN git lfs pull
    RUN npm run build
    
    # ---- Runner Stage ----
    FROM nginx:alpine AS runner
    
    WORKDIR /usr/share/nginx/html
    
    # Copy built files from builder stage
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Expose port 80 (Traefik will handle HTTPS)
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]
    