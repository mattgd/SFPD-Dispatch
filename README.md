# SFPD-Dispatch
SFPD Dispatch Analytics web app for Capital One's MindSumo challenge. Built using Python, Django (and GeoDjango), PostgreSQL, and JavaScript + jQuery and deployed on Heroku.

## Setting Up the Django Database
```
CREATE DATABASE dispatch;
CREATE USER dispatchuser WITH PASSWORD '<password>';

ALTER ROLE dispatchuser SET client_encoding TO 'utf8';
ALTER ROLE dispatchuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE dispatchuser SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE dispatch TO dispatchuser;
```

### Add the PostGIS Extension

1. Ensure psql is in the `PATH`. On Mac with `Postgres.app` this is `PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"`
2. Connect to Heroku psql: `heroku pg:psql`
3. Run the create extension command: `create extension postgis;`
4. Exit psql: `\q`

### Migrate Models from Django

`python manage.py migrate`

### Uploading Data Using Fixtures

On Heroku, login to bash using `heroku run bash` then navigate to `/dispatch`
and type: `python manage.py loaddata sfpd_dispatch_data_subset.json`.

## Heroku Geo Buildpack

The current buildpack used to support the django-geo functionality is:
`https://github.com/mattgd/heroku-geo-buildpack.git`

Add the following to the `settings.py` file:
```
# GeoDjango library paths for Heroku
GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH')
GEOS_LIBRARY_PATH = os.environ.get('GEOS_LIBRARY_PATH')

django_heroku.settings(locals())

# Update the database information for Heroku
DATABASES['default'] = dj_database_url.config()
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
```

Set the following config vars:
```
GDAL_LIBRARY_PATH=/app/.heroku/vendor/lib/libgdal.so
GEOS_LIBRARY_PATH=/app/.heroku/vendor/lib/libgeos_c.so
UPDATE_DATABASE_ENGINE = True
```

If GDAL and GEOS shared libraries are "not found", ensure `GDAL_LIBRARY_PATH` is set to
`/app/.heroku/vendor/lib/libgdal.so` and `GEOS_LIBRARY_PATH` is set to `/app/.heroku/vendor/lib/libgeos_c.so`.

## virtualenv activate Script Edits

In order to support the environment variable requirements locally for this app, the
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
