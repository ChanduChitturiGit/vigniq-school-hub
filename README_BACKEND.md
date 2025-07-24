# 🏫 School Management Backend

This project provides the backend server for managing multiple school databases with custom migrations and multi-worker ASGI support.

---

## 🐍 Setting Up the Conda Environment

Before running the server or any management commands, set up the Conda environment.

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Create the Conda environment using the provided `environment.yml` file:

    ```bash
    conda env create -f environment.yml
    ```

3. Activate the environment:

    ```bash
    conda activate <your-env-name>
    ```

    > 🔁 Replace `<your-env-name>` with the environment name defined in `environment.yml` (check the `name:` field at the top of the file).

---
## 🛠 Running Migrations for default db

```bash
python manage.py migrate
```

---

## 🛠 Running Custom Migrations for School Databases

This project includes a custom Django management command to apply migrations across multiple school-specific databases.

To run the custom migration command:

```bash
python manage.py custome_school_dbs_migrate
```
---

## 🚀 Starting the Backend Server

To start the backend server with multiple workers using `uvicorn`, run:

```bash
uvicorn config.asgi:application --host 127.0.0.1 --port 8000 --workers 4
```
---

