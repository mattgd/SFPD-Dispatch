from django.db import models
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.geos import GEOSGeometry
from metrics.models import Call
import json

neighborhoods = json.load(open('../data/neighborhoods.json'))

MULTIPOLYGON_COL = 8 # Index for the multipolygon object
NEIGHBORHOOD_COL = 9 # Index for the neighborhood name

def populate_neighborhood_district():
    calls = Call.objects.all()

    for call in calls:
        neighborhood = get_neighborhood(call.point)

        if neighborhood:
            call.neighborhood_district = neighborhood
            call.save()
            print("Added neighborhood for Call #" + str(call.pk) + ".")

    print("Neighborhood population complete.")
    
def get_neighborhood(point):
    """
    Gets the neighborhood name for the specified GEOS POINT.
    Returns None if no neighborhood is found.
    """
    for n in neighborhoods["data"]:
        multipolygon = GEOSGeometry(n[MULTIPOLYGON_COL])

        if multipolygon.contains(point):
            return n[NEIGHBORHOOD_COL]

    return None