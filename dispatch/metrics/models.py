from django.db import models
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.geos import GEOSGeometry

class Call(models.Model):
    """
    Model for a dispatch call record.
    """
    call_number	= models.IntegerField()
    unit_id = models.CharField(max_length=10)
    incident_number	= models.IntegerField()
    call_type = models.TextField()
    call_date = models.DateField()
    watch_date = models.DateField()
    received_timestamp = models.DateTimeField()
    entry_timestamp	= models.DateTimeField()
    dispatch_timestamp = models.DateTimeField()
    response_timestamp = models.DateTimeField(null=True, blank=True)
    on_scene_timestamp = models.DateTimeField(null=True, blank=True)
    transport_timestamp = models.DateTimeField(null=True, blank=True)
    hospital_timestamp = models.DateTimeField(null=True, blank=True)
    call_final_disposition = models.TextField()
    available_timestamp = models.DateTimeField()
    address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)
    zipcode_of_incident	= models.CharField(max_length=5)
    battalion = models.CharField(max_length=3)
    station_area = models.CharField(max_length=2)
    box	= models.CharField(max_length=4)
    original_priority = models.CharField(max_length=1)
    priority = models.CharField(max_length=1)
    final_priority = models.IntegerField()
    als_unit = models.BooleanField()
    call_type_group	= models.TextField(null=True, blank=True)
    number_of_alarms = models.IntegerField()
    unit_type = models.TextField()
    unit_sequence_in_call_dispatch = models.IntegerField()
    fire_prevention_district = models.CharField(max_length=4)
    supervisor_district	= models.CharField(max_length=2)
    neighborhood_district = models.CharField(max_length=100, null=True)
    location = models.TextField()
    row_id = models.TextField()
    latitude = models.DecimalField(max_digits=12, decimal_places=10)
    longitude = models.DecimalField(max_digits=13, decimal_places=10)
    point = gismodels.PointField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.point = GEOSGeometry('POINT({0} {1})'.format(self.longitude, self.latitude)) 
        super(Call, self).save(*args, **kwargs)  