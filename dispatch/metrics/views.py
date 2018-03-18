from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.conf.urls.static import static
from django.db.models import Avg, Count, F, TimeField, OuterRef, Sum, Subquery
from django.db.models.functions import Cast, TruncDay, TruncHour

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
    def get(self, request):
        """
        Returns the average calls hour of day from the database.
        """
        data = {
            "labels": [],
            "data": []
        }

        # Get all calls grouped by day and hour, ordered by hour
        day_calls = Call.objects.annotate(
            hour=TruncHour('received_timestamp'),
            day=TruncDay('received_timestamp'),
        ).values('day', 'hour').annotate(
            count=Count('pk')
        ).order_by('hour')

        # Creates a list to hold the total calls for each hour of the day
        hours = [0] * 24

        # Creates labels for each hour of the day
        labels = []
        for i in range(0, 24):
            hour_label = str('0' + str(i) if i < 10 else i) + ':00'
            labels.append(hour_label)

        days = [] # The days that have been accounted for
        total_days = 0 # The total number of days in the data set

        # Iterate through each day-hour call total and add the count of calls
        # to the hours list. When encountering a new day value, increment the
        # total days (used for calculating the average)
        for call in day_calls:
            if call["day"] not in days:
                days.append(call["day"])
                total_days += 1

            hours[call["hour"].hour] += call["count"]

        # Calculate average over each day of results
        hours = [round(hour_count / total_days, 2) for hour_count in hours]

        # Add the data to the results list
        data["labels"] = labels
        data["data"] = hours

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