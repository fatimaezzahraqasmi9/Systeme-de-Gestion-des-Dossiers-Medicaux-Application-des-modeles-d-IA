FROM python:3.12-slim

WORKDIR /app

# Installation des dependances (couche mise en cache tant que requirements.txt ne change pas).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code applicatif + modele .pkl.
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
