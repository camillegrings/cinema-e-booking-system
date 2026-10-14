# Cinema E-Booking System

Authors: Cahlil Tillett, Camille Grings Silva, JJ Huynh, Wren Nicol. (Group 9)

A cinema e-booking system built with **React, Vite, and MySQL**.

This README explains how to set up and run the project locally for development and grading.

## Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (included with Node.js)
- **MySQL Community Server**
- **Git** (if cloning the repository)

You can verify your Node.js and npm installations with:

```bash
node --version
npm --version
```

You can verify MySQL with:

```bash
mysql --version
```

## 1. Install MySQL

If MySQL is not already installed, download and install **MySQL Community Server** from the official MySQL website.

During installation, make sure to remember the password created for the MySQL `root` user. Or use empty string as the password.

After installation, make sure the MySQL server is running.

You can test the connection with:

```bash
mysql -u root -p
```

Enter the MySQL root password when prompted.

To exit MySQL:

```sql
exit;
```

## 2. Clone the Repository

Clone the project and move into the project directory:

```bash
git clone <REPOSITORY-URL>
cd <PROJECT-DIRECTORY>
```

## 3. Install Project Dependencies

From the project root directory, run:

```bash
npm install
```

This installs the dependencies defined in `package.json`.

## 4. Create the MySQL Database and Run `schema.sql`

The project uses a MySQL database named:

```text
cinema_booking
```

Start MySQL:

```bash
mysql -u root -p
```
Copy the code from [schema.sql](./db/schema.sql) file and paste it in the terminal.

## 6. Run `seed.sql`

The `seed.sql` file contains the initial/sample data required to use the application.

After running `schema.sql`, copy the code from [seed.sql](./db/seed.sql) file and paste in the terminal.

You can verify that data was inserted by selecting from one of the tables. For example:

```sql
USE cinema_booking;
SELECT * FROM movies;
```

### Important

Run the SQL files in this order:

```text
schema.sql
    ↓
seed.sql
```

The schema must be created before the seed data is inserted.

## 7. Configure Environment Variables

If required, you can adjust the `.env` to match the local database configuration.

## 8. Start the Application

Once MySQL is running and the database has been initialized, start the Vite development server:

```bash
npm run dev
```

Vite will display the local address in the terminal. It will normally be similar to:

```text
http://localhost:5173
```

Open the displayed URL in a web browser.

## 9. Running the Project

The basic startup sequence is:

### Terminal 1 — MySQL

Make sure the MySQL server is running.

### Terminal 2 — Project

From the project directory:

```bash
npm install
npm run dev
```

Then open the URL provided by Vite.

## Technologies

- React
- Vite
- MySQL
- JavaScript
- Node.js / npm
