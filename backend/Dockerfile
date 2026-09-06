FROM python:3.14-slim

WORKDIR /app

COPY requirements/ requirements/

RUN pip --no-cache-dir install -r requirements/production.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]