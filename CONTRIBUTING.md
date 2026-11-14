# Contribute a small, teachable change

Start by running the course yourself. A confusing instruction is a useful issue.

For a code change, create a branch, change one behavior, add a meaningful
regression test, and update the matching lesson and API contract. Run
`npm run check` and `npm test` before opening a pull request. Include what
you observed and how another person can repeat the check.

Do not include `.env`, local orders, backups, screenshots containing keys or
practice answers. Keep deliberate faults inside learning fixtures.

For a lesson change, check every command in a clean folder and say which OS
you used. Explain a new term before requiring it. Include a short hands-on
task, an expected observation, a repair and a proof of learning.

Future platforms should be independent teaching repos that reuse this lesson
format. This app should remain small enough to understand.

The original code and lessons use the [MIT License](LICENSE). Keep its notice
when reusing them, and credit contributions accurately.
