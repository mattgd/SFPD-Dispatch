from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.conf.urls.static import static
from django.db.models import Avg, Count, F, TimeField, OuterRef, Sum, Subquery
from django.db.models.functions import Cast, TruncDay, TruncHour, ExtractWeek

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
        return render(request, 'dispatch_metrics.html', {'title': 'Dispatch Metrics'})

class Heatmaps(View):
    """
    Class-based view for the heatmaps page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page
        return render(request, 'heatmaps.html', {'title': 'Heatmaps'})

class IncidentMetrics(View):
    """
    Class-based view for the incident metrics page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page
        return render(request, 'incident_metrics.html', {'title': 'Incident Metrics'})

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

class NeighborhoodTrends(View):

    def get(self, request):
        """
        Returns JSON representing a list of each neighborhood and the number
        of calls per day over the data time period.
        """
        neighborhoods = [
            "Mission", "Western Addition", "Sunset/Parkside",
            "Financial District/South Beach", "South of Market"
        ]
        # Gets calls grouped by day and neighborhood
        calls = Call.objects.filter(neighborhood_district__in=neighborhoods).values(
            'call_date', 'neighborhood_district'
        ).annotate(
            calls=Count('pk'),
            incidents=Count('incident_number', distinct=True)
        ).order_by('call_date')
        
        # Populates the data list for the JSON response
        data = {
            "labels": [],
            "datasets": {}
        }

        count = 0
        bgColors = get_background_colors(len(neighborhoods))
        borderColors = get_border_colors(len(neighborhoods))

        for call in calls:
            neigh = call["neighborhood_district"]
            date = call["call_date"]

            if date not in data["labels"]:
                data["labels"].append(date)

            if neigh in data["datasets"]:
                data["datasets"][neigh]["data"].append(call["incidents"])
            else:
                data["datasets"][neigh] = {
                    "label": neigh,
                    "data": [call["incidents"]],
                    "fill": "false",
                    "backgroundColor": bgColors[count],
                    "borderColor": borderColors[count],
                    "borderWidth": 1
                }

                count += 1

        # Turn the datasets dictionary into a list for Chart.js
        data["datasets"] = list(data["datasets"].values())

        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

    
def get_background_colors(amount):
    """
    Returns an Array of rgba colors to chart background colors.
    @param amount: The number of colors to return (currently a max of 11).
    @return: an Array of rgba colors to chart background colors.
    """
    bg_colors = [
        'rgba(227, 26, 28, 0.3)',
        'rgba(31, 120, 180, 0.3)',
        'rgba(178, 223, 138, 0.5)',
        'rgba(106, 61, 154, 0.3)',
        'rgba(255, 127, 0, 0.3)',
        'rgba(251, 154, 153, 0.3)',
        'rgba(253, 191, 111, 0.3)',
        'rgba(51, 160, 44, 0.3)',
        'rgba(141, 211, 199, 0.5)',
        'rgba(202, 178, 214, 0.3)',
        'rgba(243, 128, 255, 0.3)'
    ]

    colors_len = len(bg_colors)
    return bg_colors[0:amount if amount < colors_len else colors_len]

def get_border_colors(amount):
    """
    Returns an Array of rgba colors to chart border colors.
    @param amount: The number of colors to return (currently a max of 11).
    @return: an Array of rgba colors to chart border colors.
    """
    border_colors = get_background_colors(amount)

    for i in range(0, len(border_colors)):
        color = border_colors[i]
        border_colors[i] = color[0:len(color) - 4] + '1)'

    return border_colors