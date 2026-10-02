#!/bin/sh

set -eu

role="${CONTAINER_ROLE:-${1:-web}}"

export PORT="${PORT:-8080}"

echo "======================================"
echo "TilePOS container starting"
echo "Role: ${role}"
echo "Port: ${PORT}"
echo "======================================"

mkdir -p \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage/app/private \
    /var/www/html/storage/app/public \
    /var/www/html/storage/framework/cache \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /tmp/nginx-client-body \
    /tmp/nginx-fastcgi

chown -R www-data:www-data \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage \
    /tmp/nginx-client-body \
    /tmp/nginx-fastcgi

if [ "$role" = "web" ]; then

    echo "Testing PHP-FPM configuration..."
    php-fpm -t

    echo "Caching Laravel configuration..."
    php artisan config:cache

    echo "Caching Laravel views..."
    php artisan view:cache

    echo "Creating storage link..."
    php artisan storage:link --force >/dev/null 2>&1 || true

    echo "Generating nginx configuration..."

    envsubst '${PORT}' \
        < /etc/nginx/templates/default.conf.template \
        > /tmp/nginx.conf

    echo "Generated nginx configuration:"
    cat /tmp/nginx.conf

    echo "Testing nginx configuration..."
    nginx -t -c /tmp/nginx.conf

    echo "Starting PHP-FPM..."

    php-fpm -D

    sleep 2

    if [ ! -s /tmp/php-fpm.pid ]; then
        echo "ERROR: PHP-FPM PID file was not created."
        exit 1
    fi

    PHP_FPM_PID="$(cat /tmp/php-fpm.pid)"

    if ! kill -0 "$PHP_FPM_PID" 2>/dev/null; then
        echo "ERROR: PHP-FPM is not running."
        exit 1
    fi

    echo "PHP-FPM is running with PID ${PHP_FPM_PID}"

    echo "Starting nginx on port ${PORT}..."

    exec nginx \
        -c /tmp/nginx.conf \
        -g 'daemon off;'
fi

if [ "$role" = "worker" ]; then
    exec php artisan queue:work \
        --verbose \
        --tries="${QUEUE_TRIES:-3}" \
        --timeout="${QUEUE_TIMEOUT:-90}"
fi

if [ "$role" = "scheduler" ]; then
    exec php artisan schedule:work
fi

echo "Unsupported CONTAINER_ROLE: $role" >&2

exit 1