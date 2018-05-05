FROM python:2.7-alpine

# TODO: run only stuff needed
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    libc-dev \
    linux-headers

WORKDIR /app

COPY requirements.txt /app/

# install
RUN pip install uwsgi

# install requirements
RUN pip install -r requirements.txt

COPY ./ /app

RUN addgroup -S uwsgi
RUN adduser -S -g uwsgi uwsgi