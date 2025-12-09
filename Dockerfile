FROM node:18-alpine


RUN apk add --no-cache bash netcat-openbsd


WORKDIR /app


COPY package*.json ./


RUN npm ci --only=production


COPY . .


COPY public ./public


RUN mkdir -p uploads


RUN chmod -R 755 /app


RUN echo '#!/bin/sh' > /app/wait-for-it.sh && \
    echo 'set -e' >> /app/wait-for-it.sh && \
    echo 'host="$1"' >> /app/wait-for-it.sh && \
    echo 'shift' >> /app/wait-for-it.sh && \
    echo 'port="$1"' >> /app/wait-for-it.sh && \
    echo 'shift' >> /app/wait-for-it.sh && \
    echo 'echo "Waiting for $host:$port..."' >> /app/wait-for-it.sh && \
    echo 'until nc -z "$host" "$port"; do' >> /app/wait-for-it.sh && \
    echo '  sleep 2' >> /app/wait-for-it.sh && \
    echo '  echo "Still waiting for $host:$port..."' >> /app/wait-for-it.sh && \
    echo 'done' >> /app/wait-for-it.sh && \
    echo 'echo "✅ $host:$port is available!"' >> /app/wait-for-it.sh && \
    echo 'exec "$@"' >> /app/wait-for-it.sh && \
    chmod +x /app/wait-for-it.sh


EXPOSE 3000


ENV NODE_ENV=production
ENV PORT=3000


HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"


CMD ["node", "index.js"]