FROM nginx:1.19.3

ARG BUILD_CONFIG="prod"

COPY ./nginx/nginx-custom.conf /etc/nginx/conf.d/default.conf

RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install -y git

WORKDIR /toneye

COPY ./ /toneye

RUN npm install

RUN node ./node_modules/@angular/cli/bin/ng build --configuration=${BUILD_CONFIG}

RUN rm -rf /usr/share/nginx/html/*
RUN mv ./dist/tonexplorer/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]