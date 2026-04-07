# Multi-stage build for HomeBase API
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/HomeBase.Api/HomeBase.Api.csproj", "src/HomeBase.Api/"]
COPY ["src/HomeBase.Application/HomeBase.Application.csproj", "src/HomeBase.Application/"]
COPY ["src/HomeBase.Domain/HomeBase.Domain.csproj", "src/HomeBase.Domain/"]
COPY ["src/HomeBase.Infrastructure/HomeBase.Infrastructure.csproj", "src/HomeBase.Infrastructure/"]
RUN dotnet restore "src/HomeBase.Api/HomeBase.Api.csproj"
COPY src/ src/
WORKDIR "/src/src/HomeBase.Api"
RUN dotnet build "HomeBase.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HomeBase.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "HomeBase.Api.dll"]
