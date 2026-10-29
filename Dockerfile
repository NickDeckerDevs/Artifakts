FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATA_DIR=/data ART_DIR=/art PORT=8787
WORKDIR /app
COPY server.py /app/server.py
RUN useradd --create-home --uid 10001 inbox \
    && mkdir -p /data \
    && chown -R inbox:inbox /data /app
USER inbox
EXPOSE 8787
CMD ["python", "/app/server.py"]

