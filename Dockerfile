# syntax=docker/dockerfile:1.7

ARG PHP_VERSION=8.3
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS node-runtime

FROM php:${PHP_VERSION}-cli-bookworm AS php-dependencies

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libonig-dev \
        libpq-dev \
        libsqlite3-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        intl \
        mbstring \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        xml \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM node:${NODE_VERSION}-bookworm-slim AS frontend-dependencies

ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /var/www/html

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

FROM php-dependencies AS frontend-build

ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /var/www/html

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm

RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY package.json package-lock.json ./
RUN npm ci

COPY --from=php-dependencies /var/www/html/vendor ./vendor
COPY . .
RUN npm run build

FROM php:${PHP_VERSION}-fpm-bookworm AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    BROWSERSHOT_NODE_PATH=/usr/local/bin/node \
    BROWSERSHOT_CHROME_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium \
        curl \
        gettext-base \
        nginx \
        libicu-dev \
        libonig-dev \
        libpq-dev \
        libsqlite3-dev \
        libxml2-dev \
        libzip-dev \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        intl \
        mbstring \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        xml \
        zip \
    && sed -i \
        -e 's|^;error_log = log/php-fpm.log|error_log = /proc/self/fd/2|' \
        -e 's|^;pid = run/php-fpm.pid|pid = /tmp/php-fpm.pid|' \
        /usr/local/etc/php-fpm.conf \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

WORKDIR /var/www/html

COPY --from=php-dependencies /var/www/html/vendor ./vendor
COPY --from=frontend-dependencies /usr/local/bin/node /usr/local/bin/node
COPY --from=frontend-dependencies /var/www/html/node_modules ./node_modules
COPY --from=frontend-build /var/www/html/public/build ./public/build
COPY . .

COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/entrypoint.sh /usr/local/bin/tilepos-entrypoint

RUN rm -f /usr/local/etc/php-fpm.d/docker.conf \
    && mkdir -p \
        /var/lib/nginx \
        /tmp/nginx-client-body \
        /tmp/nginx-fastcgi \
        bootstrap/cache \
        storage/app/private \
        storage/app/public \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data /var/lib/nginx bootstrap/cache storage \
    && chmod +x /usr/local/bin/tilepos-entrypoint

# USER www-data

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:${PORT:-8080}/up || exit 1

ENTRYPOINT ["tilepos-entrypoint"]
CMD ["web"]
