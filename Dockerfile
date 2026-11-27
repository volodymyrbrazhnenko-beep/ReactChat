FROM node:22-alpine AS client-build
WORKDIR /src/reactchat.client
COPY reactchat.client/package*.json ./
RUN npm ci
COPY reactchat.client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS publish
WORKDIR /src
COPY . .
COPY --from=client-build /src/reactchat.client/dist /src/ReactChat.Server/wwwroot
RUN dotnet publish ReactChat.Server/ReactChat.Server.csproj --configuration Release --output /app/publish /p:UseAppHost=false /p:ShouldRunNpmInstall=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ReactChat.Server.dll"]
