FROM hayd/alpine-deno:1.4.0

ENV PORT=8080

WORKDIR /app

COPY deps.ts .

RUN deno cache deps.ts

COPY . .

RUN deno cache server.ts

EXPOSE ${PORT}

CMD ["run", "--allow-net", "--allow-read","--allow-env","server.ts"]