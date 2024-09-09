FROM node:18-alpine as builder

WORKDIR /opt/server
COPY . .
RUN npm i
RUN npm run tsoaGen
#RUN npm prune

FROM node:18-alpine
WORKDIR /opt/server
COPY --from=builder /opt/server/dist /opt/server/dist
COPY --from=builder /opt/server/.env /opt/server/.env
COPY --from=builder /opt/server/node_modules /opt/server/node_modules
COPY --from=builder /opt/server/package.json /opt/server/package.json
EXPOSE 5004
ENTRYPOINT ["npm" , "run", "r:p"]


