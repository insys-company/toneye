# Toneye
[Live Demo (Korean)](http://toneye.app/)

[Live Demo (English)](http://en.toneye.app/)

This is a web-based Free TON Network blockchain explorer.

Supported languages:
- English
- Korean

## Development Setup

### Prerequisites

- Install [Node.js](https://nodejs.org/) which includes [Node Package Manager](https://www.npmjs.com/get-npm)

### Quick Start

1. Install packages:
```
npm install
```
2. Buld the application:

Korean version:
```
ng build --configuration=dev-kor
```

English version:
```
ng build --configuration=dev
```
3. Run dev server:

Korean version:
```
ng serve --configuration=dev-kor
```

English version:
```
ng server --configuration=dev
```
4. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Use `prod` (English version) and `prod-kor` (Korean version) configurations to build the application for production environment.

## Server Installation

### Requirements

 - Docker Engine 19.03.0 or higher ([How to install Docker](https://docs.docker.com/engine/install/))
 - Docker Compose 1.25.5 or higer ([How to install Docker Compose](https://docs.docker.com/compose/install/))

### Installation

#### Docker CLI
```
docker pull insyscompany/toneye:release && \
docker run -it -p 8080:80 -p 8443:443 --detach --restart always --log-opt max-size=50m --name toneye insyscompany/toneye:release
```

#### Docker Compose CLI
```
docker-compose up -d toneye
```

### Build

Docker CLI
```
docker build . -t insyscompany/toneye:release
```

Docker Compose CLI
```
docker-compose build toneye
```