FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AUTH_MODE
RUN npm run build
EXPOSE 8080
CMD ["node", "server.js"]
