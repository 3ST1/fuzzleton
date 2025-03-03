# ---- Builder Stage ----
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Install Git and Git LFS
    RUN apk add --no-cache git git-lfs \
        && git lfs install --skip-repo
    
    # Copy package.json and package-lock.json first to install dependencies early
    COPY package.json package-lock.json ./
    RUN npm install --frozen-lockfile
    
    # Now copy the rest of the application code
    COPY . .
    
    # Ensure Git LFS files are downloaded
    RUN git lfs pull
    
    # Build the project
    RUN npm run build
    
    # ---- Runner Stage ----
    FROM caddy:2.6.4-alpine AS runner
    
    WORKDIR /srv
    
    # Copy built files from builder stage to Caddy's default serve location
    COPY --from=builder /app/dist /srv
    
    # Use Caddy to serve the static files
    CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":5173"]
    