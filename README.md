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
```
ng build
```
3. Run dev server:
```
ng serve
```
4. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Server Installation

### Requirements

 - Docker Engine 19.03.0 or higher
 - Docker Compose 1.25.5 or higer

### Installation

#### English version

Docker CLI
```
docker pull insyscompany/toneye:release && \
docker run -it -p 8080:80 -p 8443:443 --detach --restart always --log-opt max-size=50m --name toneye insyscompany/toneye:release
```

Docker Compose CLI
```
docker-compose up -d toneye
```

#### Korean version

Docker CLI
```
docker pull insyscompany/toneye:release-korean && \
docker run -it -p 8080:80 -p 8443:443 --detach --restart always --log-opt max-size=50m --name toneye-korean insyscompany/toneye:release-korean
```

Docker Compose CLI
```
docker-compose up -d toneye-korean
```

### Build

#### English version

Docker CLI
```
docker build . -t insyscompany/toneye:release
```

Docker Compose CLI
```
docker-compose build toneye
```

#### Korean version

Docker CLI
```
docker build . -t insyscompany/toneye:release-korean
```

Docker Compose CLI
```
docker-compose build toneye-korean
```