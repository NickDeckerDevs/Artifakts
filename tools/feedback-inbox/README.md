# Sidelines Feedback Inbox

A small local Docker app for reviewing Google Forms suggestions by badge. The public GitHub Pages gallery continues to use the anonymous Google Form; this inbox imports the form's CSV export and stores it in a local Docker volume. No API keys, Google API setup, tunnel, or public server are involved.

## Start

From this folder, run:

    docker compose up --build -d

Open http://127.0.0.1:8787. The container listens only on the local computer.

## Add suggestions

1. Open the Sidelines Pixel Art Design Feedback form and choose Responses.
2. Use the form's menu to download responses as a CSV.
3. In the local inbox, choose that CSV and select Import CSV.
4. Choose a badge to review its suggestions. Add a private note or change each response's status.

Importing the same export again skips duplicate responses. The inbox ignores any email columns in an export. Google Forms remains the collection point for visitors; the CSV transfer is a manual review step.

## Data and privacy

The app binds to 127.0.0.1 on this computer and has no public endpoint. Imported suggestions and local review notes are kept in the Docker volume named feedback_data. The app does not request or store respondent email addresses.

Stop the app with:

    docker compose down

The review data stays in the volume. To permanently remove the local database, remove the volume with:

    docker compose down -v

