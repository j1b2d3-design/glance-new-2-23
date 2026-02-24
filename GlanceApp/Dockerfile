# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

# 只拷贝服务器所需文件
COPY package.json ./
COPY server.mjs ./

# 只安装服务器需要的依赖（ws + @supabase/supabase-js）
RUN npm install ws @supabase/supabase-js

EXPOSE 3000
CMD ["node", "server.mjs"]
