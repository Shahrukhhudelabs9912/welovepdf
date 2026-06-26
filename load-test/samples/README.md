# Sample test files

The single-user latency profiler (`../single-user-profile.js`) auto-uses any
of these files if present, and skips the corresponding endpoint if missing:

| file               | endpoint(s)         |
| ------------------ | ------------------- |
| `sample.docx`      | `/api/word-to-pdf`  |
| `sample.xlsx`      | `/api/excel-to-pdf` |

Drop minimal valid files here (a one-page Word doc, a small spreadsheet with
2-3 rows) to include those endpoints in the profile. Don't commit large or
private documents — keep them tiny so latency measures pure server time, not
network/upload overhead.
