# RPL Registration Backend

This is the backend server for the Raj Premier League Registration system. It connects to MySQL and implements a dynamic form schema with JSON storage.

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (phpMyAdmin, DBeaver, MySQL Workbench, or Command Line).
2. Run the schema creation file:
   - File path: `database/db_schema.sql` (Creates database `rpl_db` and tables).
3. Run the questions seed file:
   - File path: `database/db_seed.sql` (Populates all the current RPL questions and sports categories).

### 2. Environment Variables Configuration
1. Go to the `server/` directory.
2. Duplicate the `.env.example` file and rename it to `.env`.
3. Open `.env` and fill in your local MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=rpl_db
   ```
4. To enable dynamic file uploads (receipt screenshots and photos), configure your Google Cloud Console Service Account, share a Google Drive folder with the Service Account email, and add the credentials to your `.env` file.

### 3. Install Dependencies & Run
In your terminal, navigate to the `server` folder and run:

```bash
cd server
npm install
```

To run in development mode (with hot reloading via nodemon):
```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## Backend API Endpoints

* **`GET /api/sports`**: Returns active sports.
* **`GET /api/registration-fields`**: Returns active questions and validation rules.
* **`POST /api/upload`**: Uploads an image file to Google Drive and returns a public view link.
* **`POST /api/register`**: Validates the participant's dynamic answers and saves the submission as a JSON block.
* **`GET /api/admin/registrations`**: Used by admins to view all registrations.
* **`POST /api/admin/registrations/:id/payment`**: Updates payment status (`approved` / `rejected`).
