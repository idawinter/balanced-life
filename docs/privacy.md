# Privacy Policy — Balanced Life (Student Project)

Balanced Life is a non-commercial student capstone project. It collects only the minimum data
needed to demonstrate functionality: a user email (for demo login) and daily wellness entries
entered by the user. If the user connects Oura, the app may request access to Oura “daily”
and “personal” scopes to read daily summaries.

## Data Sources
- **User-entered data:** sleep hours, mood, water intake, menopause-related fields, supplements.
- **Oura data (optional):** daily summaries when the user authorizes via Oura OAuth.

## Use of Data
Data is used solely to display logs and trends inside the app for educational purposes.
No data is sold or shared with third parties.

## Storage & Security
Data is stored in a MongoDB Atlas database associated with this project. Reasonable student-level
security practices are followed (secrets in environment variables, server-side token exchange).
However, this is not a production system.

## Retention
Data may be deleted by clearing the database for grading or maintenance. Contact the maintainer
via the GitHub repository if you wish to request deletion of your demo data.

## Contact
Questions? Open an issue at the project repository: (https://github.com/idawinter/balanced-life)
