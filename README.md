# SFPD-Dispatch
SFPD dispatch web app for Capital One.

## Setting Up the Database
```
CREATE DATABASE dispatch;
CREATE USER dispatchuser WITH PASSWORD '<password>';

ALTER ROLE dispatchuser SET client_encoding TO 'utf8';
ALTER ROLE dispatchuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE dispatchuser SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE dispatch TO dispatchuser;
```