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

### Uploading Data Using Fixtures

On Heroku, login to bash using `heroku run bash` then navigate to `/dispatch`
and type: `python manage.py loaddata sfpd_dispatch_data_subset.json`.

## Heroku Geo Buildpack

The current buildpack used to support the django-geo functionality is:
`https://github.com/dschep/heroku-geo-buildpack.git`

## virtualenv activate Script Edits

In order to support the environment variable requirements for this app, the
following environment variables should be set at the bottom of the bin/activate
script:
```
export DATABASE_NAME=
export DATABASE_USER=
export DATABASE_PASS=
export DATABASE_HOST=
export DATABASE_PORT=5432
export DJANGO_DEBUG=False
```