from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.conf.urls.static import static
from django.db.models import Avg, Count, F
from django.db.models.functions import TruncDay, TruncHour

import datetime
import re

from .models import Call

class Home(View):
    """
    Class-based view for the home page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page with the necessary scripts as context
        return render(request, 'dispatch_metrics.html', {
            'title': 'Dispatch Metrics',
            'scripts': [
                'js/Chart.bundle.min.js',
                'js/chart_utils.js',
                'js/dispatch_metrics.js'
            ]
        })

class Heatmaps(View):
    """
    Class-based view for the heatmaps page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page with the necessary scripts as context
        return render(request, 'heatmaps.html', {
            'title': 'Heatmaps',
            'scripts': [
                'js/jquery.tablesorter.combined.min.js',
                'js/jquery.tablesorter.pager.min.js',
                'js/metrics_tables.js',
                'js/heatmaps.js'
            ]
        })

class IncidentMetrics(View):
    """
    Class-based view for the incident metrics page.
    """
    def get(self, request, *args, **kwargs):
        # Render the page with the necessary scripts as context
        return render(request, 'incident_metrics.html', {
            'title': 'Incident Metrics',
            'scripts': [
                'js/Chart.bundle.min.js',
                'js/chart_utils.js',
                'js/jquery.tablesorter.combined.min.js',
                'js/jquery.tablesorter.pager.min.js',
                'js/metrics_tables.js',
                'js/incident_metrics.js'
            ]
        })

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
        calls = Call.objects.values('call_type_group').annotate(
            avg_dispatch_time=Avg(F('dispatch_timestamp') - F('received_timestamp'))
        ).order_by('-avg_dispatch_time')

        # Add the data to the results list
        for call in calls:
            group = call["call_type_group"] if call["call_type_group"] else 'Other'

            # Truncate life-threatening groups
            group = re.sub(r'([tT]hreatening)', 'Threat.', group)
            
            data["labels"].append(group) # Add the label

            seconds = call["avg_dispatch_time"].seconds
            data["data"].append(round(seconds / 60, 2)) # Add the time

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
        ).values('day', 'hour').annotate(count=Count('pk')).order_by('hour')

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

    def post(self, request):
        """
        Returns JSON representing the chart data for a specific battalion's
        call_type disribution.
        """
        response = None
        battalion = request.POST.get('battalion')

        if battalion:
            # Gets calls grouped by type
            calls = Call.objects.filter(battalion=battalion).values(
                'call_type'
            ).annotate(
                call_count=Count('pk')
            ).order_by('call_type')
            
            # Populates the data list for the JSON response
            colors = get_colors(calls.count(), 0.8)

            # Create the basic dictionary structure
            data = {
                "battalion": battalion,
                "total_calls": 0,
                "labels": [],
                "dataset": {
                    "data": [],
                    "backgroundColor": colors,
                    "borderWidth": 0
                }
            }

            # Append data for each call in the QuerySet
            for call in calls:
                count = call["call_count"]
                data["labels"].append(call["call_type"])
                data["dataset"]["data"].append(count)
                data["total_calls"] += count

            # Return the JSON response
            response = JsonResponse(
                {
                    'status': 'true',
                    'data': data
                }
            )
        else:
            # No time provided, 400 Bad Request
            response = JsonResponse(
                {
                    'status': 'false',
                    'message': 'Invalid battalion.'
                },
                status=400
            )

        return response

class NeighborhoodTrends(View):

    def get(self, request):
        """
        Returns JSON representing a list of each neighborhood and the number
        of calls per day over the data time period.
        """
        # Top 5 most populous neighborhoods
        neighborhoods = [
            "Mission", "Western Addition", "Sunset/Parkside",
            "Financial District/South Beach", "South of Market"
        ]
        # Gets calls grouped by day and neighborhood
        calls = Call.objects.filter(
            neighborhood_district__in=neighborhoods
        ).values(
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

        # Used to index off of the colors lists and ensure different colors
        count = 0

        # Get the chart colors
        bgColors = get_colors(len(neighborhoods), 0.4)
        borderColors = get_colors(len(neighborhoods), 1)

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

    def post(self, request):
        """
        Returns JSON representing a neighborhood's incidents per day by call
        type and total incidents per day over the data time period.
        """
        response = None
        neighborhood = request.POST.get('neighborhood')

        # Ensure neighborhood value provided
        if neighborhood:
            # Gets calls grouped by day and type
            calls = Call.objects.filter(neighborhood_district=neighborhood).values(
                'call_date', 'call_type'
            ).annotate(
                incidents=Count('incident_number', distinct=True)
            ).order_by('call_date')
            
            # Populates the data list for the JSON response
            data = {}
            types = []

            # Prepare data for Chart.js formatting
            for call in calls:
                call_date = str(call["call_date"])
                call_type = call["call_type"]

                if call_date not in data:
                    data[call_date] = {
                        "datasets": {},
                        "total_incidents": 0
                    }

                # Aggregate a list of call_type values
                if call_type not in types:
                    types.append(call_type)

                data[call_date]["datasets"][call_type] = call["incidents"]
                data[call_date]["total_incidents"] += call["incidents"]

            colors = get_colors(len(types) + 1, 0.8)
            dates = list(data.keys())
            response_data = {
                "neighborhood_district": neighborhood,
                "labels": dates,
                "datasets": []
            }
            
            # Organize data into chart-compatible format
            count = 0 # Index for unique chart colors
            incident_count = None
            total_incidents = []
            for call_type in types:
                dataset = {
                    "label": call_type,
                    "data": [],
                    "backgroundColor": colors[count],
                    "borderWidth": 0,
                    "yAxisID": "bar-y-axis",
                }

                # Adds the incident count for each call type for each day
                for date in dates:
                    if call_type in data[date]["datasets"]:
                        incident_count = data[date]["datasets"][call_type]
                    else:
                        incident_count = 0

                    # Append incident count or 0 if there were no incidents
                    # of that call_type for the given date
                    dataset["data"].append(incident_count)
                    total_incidents.append(data[date]["total_incidents"] if "total_incidents" else 0)
                
                response_data["datasets"].append(dataset)
                count += 1

            # Insert the total incidents per day data at the front of the
            # the datasets list as the line chart
            response_data["limits"] = {
                "min": min(total_incidents),
                "max": max(total_incidents)
            }

            # Data required to create a line chart for total incidents
            total_incidents = {
                "data": total_incidents,
                "type": "line",
                "label": "Total Incidents",
                "fill": "false",
                "backgroundColor": "#333333",
                "borderColor": "#222222",
                "pointHitRadius": 10,
            }
            response_data["datasets"].insert(0, total_incidents)

            # Return the JSON data
            response = JsonResponse(
                {
                    'status': 'true',
                    'data': response_data
                }
            )
        else:
            # No time provided, 400 Bad Request
            response = JsonResponse(
                {
                    'status': 'false',
                    'message': 'Invalid neighborhood.'
                },
                status=400
            )

        return response
    
def get_colors(amount, opacity):
    """
    Returns an Array of rgba colors to chart background colors.
    @param amount: The number of colors to return (currently a max of 11).
    @return: an Array of rgba colors to chart background colors.
    """
    # Available rgba colors with formattable strings for opacity
    colors = [
        'rgba(227, 26, 28, {0})',
        'rgba(31, 120, 180, {0})',
        'rgba(178, 223, 138, {0})',
        'rgba(106, 61, 154, {0})',
        'rgba(255, 127, 0, {0})',
        'rgba(251, 154, 153, {0})',
        'rgba(253, 191, 111, {0})',
        'rgba(51, 160, 44, {0})',
        'rgba(141, 211, 199, {0})',
        'rgba(202, 178, 214, {0})',
        'rgba(243, 128, 255, {0})',
        'rgba(203, 75, 22, {0})',
        'rgba(108, 113, 196, {0})',
        'rgba(38, 139, 210, {0})',
        'rgba(211, 54, 130, {0})'
    ]

    colors = [c.format(opacity) for c in colors] # Format opacity
    colors_len = len(colors)
    return colors[0:amount if amount < colors_len else colors_len]