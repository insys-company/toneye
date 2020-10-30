FROM nginx:1.19.3

ARG BUILD_CONFIG="prod"

RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install -y git

WORKDIR /toneye

RUN git clone https://github.com/insys-company/toneye.git

RUN cd toneye && npm install

RUN cd toneye && node ./node_modules/@angular/cli/bin/ng build --configuration=${BUILD_CONFIG}

RUN rm -rf /usr/share/nginx/html/*
RUN cd toneye && mv ./dist/tonexplorer/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]