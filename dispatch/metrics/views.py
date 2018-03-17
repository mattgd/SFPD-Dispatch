from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.conf.urls.static import static
from django.db.models import Avg, Count, F, TimeField
from django.db.models.functions import Cast

from geopy.geocoders import Nominatim
from django.contrib.gis import geos
import datetime
import re
import itertools

from .models import Call

class Home(View):
    """
    Class-based view for the home page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page
        return render(request, 'metrics.html')

class Heatmaps(View):
    """
    Class-based view for the heatmaps page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page
        return render(request, 'heatmaps.html')

class AverageResponseTime(View):
    """
    Class-based view for calculating average response time per call group.
    """

    def get(self, request):
        """
        Returns the average response time per call type group from the database.
        """
        data = {
            "labels": [],
            "data": []
        }

        # Get calls grouped by call_type_group and calculate the average
        # dispatch time for each group.
        calls = Call.objects.values(
            'call_type_group'
        ).annotate(
            avg_dispatch_time=Avg(F('dispatch_timestamp') - F('received_timestamp'))
        ).order_by('-avg_dispatch_time')

        # Add the data to the results list
        for call in calls:
            group = call["call_type_group"] if call["call_type_group"] else 'Other'

            # Truncate life-threatening groups
            group = re.sub(r'([tT]hreatening)', 'Threat.', group)
            
            data["labels"].append(group)

            seconds = call["avg_dispatch_time"].seconds
            data["data"].append(round(seconds / 60, 2))

        # Return the JSON response
        return JsonResponse(
            {
                "status": "true",
                "data": data
            }
        )

class AverageCallsPerHour(View):
    """
    Class-based view for calculating the average calls per hour of day.
    """

    def date_hour(self, timestamp):
        """
        Converts a timestamp to a two digit hour string.
        """
        return timestamp.strftime("%H")

    def get(self, request):
        """
        Returns the average calls hour of day from the database.
        """
        data = {
            "labels": [],
            "data": []
        }

        # Get all calls ordered by received_timestamp
        calls = Call.objects.order_by(Cast('received_timestamp', TimeField()))

        # Group the calls data by hours of the day
        hours = itertools.groupby(
            calls, lambda call: self.date_hour(call.received_timestamp)
        )    
        
        # Add the data to the results list
        for hour, matches in hours:
            data["labels"].append(hour + ':00')

            total_calls = sum(1 for x in matches)
            data["data"].append(total_calls)

        # Return the JSON response
        return JsonResponse(
            {
                "status": "true",
                "data": data
            }
        )

class BattalionDistribution(View):
    """
    Class-based view for calculating the calls per battalion.
    """
    
    def get(self, request):
        """
        Returns the count of calls for each unique battalion in the database.
        """
        data = {
            "labels": [],
            "data": []
        }

        # Get calls grouped by battalion and count that battalion's calls assigned
        calls = Call.objects.values('battalion').annotate(
            count=Count('battalion')
        ).order_by('battalion')

        # Add the data to the results list
        for call in calls:
            data["labels"].append(call["battalion"])
            data["data"].append(call["count"])

        # Return the JSON response
        return JsonResponse(
            {
                "status": "true",
                "data": data
            }
        )