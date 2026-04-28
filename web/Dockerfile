FROM node:20-alpine AS base

# --- Etapa de dependências ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Etapa de desenvolvimento ---
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "dev"]

# --- Etapa de build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=placeholder-key

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

# A compilação no Next.js geralmente requer variáveis de ambiente,
# Elas podem ser passadas durante o build ou ignoradas usando --ignore-build-errors.
# Neste caso rodamos o build padrão
RUN npm run build

# --- Etapa de produção ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Adicione as variáveis de ambiente necessárias que deverão ser populadas em runtime
# ENV NEXT_PUBLIC_SUPABASE_URL=...

COPY --from=builder /app/public ./public
# Configurações do Next standalone reduzem drasticamente o tamanho da imagem final.
# NOTA: Requer `output: "standalone"` em next.config.ts se for usar em produção real com Docker.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
