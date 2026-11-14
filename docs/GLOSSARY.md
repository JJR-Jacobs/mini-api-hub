# Plain-language glossary

You do not need to memorize these. Follow a lesson and look up a word when it becomes useful.

| Term | Meaning in this project |
| --- | --- |
| API | An interface that software calls. Here, the browser calls the Hub, and the Hub calls the mock warehouse. |
| Authentication | Checking whether a caller has a valid credential. This tutorial uses API keys. |
| Authorization | Deciding what an authenticated caller may do. One shared tutorial key is not a full user-and-role system. |
| Bearer token | A credential sent in the `Authorization: Bearer ...` request header. Anyone holding it can use its access. |
| Branch | A named line of Git development. It lets you work on a change separately. |
| CI | Continuous integration: automated checks run for source changes, often in GitHub Actions. |
| Client | Software making a request, such as the browser or a PowerShell command. |
| Commit | A saved Git snapshot with a message. A local commit is not automatically uploaded anywhere. |
| Configuration | Settings that select how the program runs, such as ports and API keys. |
| Container | A way to package a process and its filesystem environment. Persistent data still needs deliberate storage. |
| Database | Structured persistent storage. This tutorial uses a local SQLite file. |
| Dependency | Something a part of the system relies on: a service, library, database or tool. |
| Deployment | Putting an application version and its configuration onto a machine where it will run. |
| Diff | The actual lines added, removed or changed between versions. |
| Directory | A folder. A terminal's working directory determines where relative paths start. |
| Endpoint | A method and path handled by an API, such as `GET /api/orders`. |
| Environment | A place and configuration where software runs: local development, staging or production. |
| Environment variable | A named setting passed to a process. A `.env` file is one way this project supplies settings. |
| ESM | JavaScript's module system using `import` and `export`. |
| Exit code | A process's result code. Zero usually means success; a nonzero code means something failed. |
| Fixture | Small, predictable test data or a scenario used to exercise behavior. |
| Header | Request or response metadata, such as `Content-Type` or `Authorization`. |
| HTTP | The request-and-response protocol used by the APIs in this course. |
| HTTPS | HTTP protected in transit by TLS. It does not replace authentication or validation. |
| Idempotency | Repeating an operation does not create another effect when it represents the same intended action. |
| JSON | A text format for structured data. It has strict rules, including double quotes around property names. |
| Liveness | Whether a service process is alive enough to answer a basic check. |
| localhost | The machine making the request. In a container, it refers to that container, not automatically your laptop. |
| Lockfile | A recorded dependency resolution used to reproduce package installation. No runtime packages are needed here. |
| Log | A record of events a program emits. A useful log explains an event without exposing secrets. |
| Migration | An intentional step that changes a database schema from one known version to another. |
| Mock service | A controllable substitute for another API. This warehouse is entirely fictional. |
| Port | A numbered network entry point. The local Hub uses 3000 and the warehouse uses 4000 by default. |
| Process | A running instance of a program. Closing a terminal may stop the process started there. |
| Pull request | A proposal to merge changes, with a diff, discussion and checks. It is not the same as a deployment. |
| Readiness | Whether a service can currently do the work it is meant to accept, including necessary dependencies. |
| Regression | Previously correct behavior that breaks after a change. |
| Repository | A project tracked by Git, including its source and history. |
| Request | A client's HTTP message asking a server to do something. |
| Response | The server's answer, with a status code, headers and sometimes a body. |
| Rollback | Returning an application or configuration to an earlier known state. Data changes can make this more complicated. |
| Route | Code that handles a matching HTTP method and path. |
| Runtime | The software executing application code. Here that is Node.js. |
| Schema | The database's structure: tables, columns and constraints. |
| Secret | A value granting access, such as an API key. It must not be committed or included in public evidence. |
| Smoke check | A small post-startup or post-deployment check of an essential journey. |
| SQL | A language for querying and changing relational data. SQLite supports SQL. |
| Staging area | Git's selection of changes for the next commit; unrelated to a staging deployment environment. |
| Status code | HTTP's result number. Examples include success, invalid input, unauthenticated access and server failure. |
| Test assertion | A precise statement of expected behavior that fails when the result differs. |
| Timeout | The caller stopped waiting. It does not necessarily mean the other service did no work. |
| Transaction | A group of database changes that succeeds or fails together within that database. It does not automatically include an external HTTP call. |
| Validation | Checking that input has the expected shape, values and limits before using it. |
| Volume | Storage attached to a container so selected data can survive container replacement. |

API keys in this course teach credential boundaries. They do not teach password storage, account recovery, sessions, multi-user permissions or the full work needed to run a public service.
