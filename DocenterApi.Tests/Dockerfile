FROM mcr.microsoft.com/dotnet/core/sdk:3.1

# disable microsoft telematry
ENV DOTNET_CLI_TELEMETRY_OPTOUT='true'

ENV DynamoDb_LocalMode='true'

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./DocenterApi.sln ./
COPY ./DocenterApi/DocenterApi.csproj ./DocenterApi/
COPY ./DocenterApi.Tests/DocenterApi.Tests.csproj ./DocenterApi.Tests/

RUN dotnet restore ./DocenterApi/DocenterApi.csproj
RUN dotnet restore ./DocenterApi.Tests/DocenterApi.Tests.csproj

# Copy everything else and build
COPY . .

RUN dotnet build -c debug -o out DocenterApi.Tests/DocenterApi.Tests.csproj

CMD dotnet test
