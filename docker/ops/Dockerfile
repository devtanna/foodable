FROM nginx:1.15.2-alpine
COPY . /var/www
COPY docker/ops/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
ENTRYPOINT ["nginx","-g","daemon off;"]