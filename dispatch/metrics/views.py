from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse

import datetime

from .models import Call

class Home(View):
    """
    Class-based view for the home page.
    """
    def get(self, request, *args, **kwargs):
        return render(request, 'metrics.html', {})

def get_metrics(request):
    """
    View for getting the dispatch metrics JSON data.
    """
    data = {
        "avg_response_time": {
            "groups": [],
            "data": []
        },
        "avg_calls_per_hour": {
            "labels": [],
            "data": []
        },
        "unit_type_distrib": {
            "labels": [],
            "data": []
        },
        "locations": []
    }

    calls = Call.objects.all()
    total_calls = calls.count()

    avg_resp_time_data = {}
    
    avg_calls_per_hour = {}
    for i in range(0, 24):
        avg_calls_per_hour[i] = 0

    days = []
    total_days = 0

    unit_type_distrib = {}

    for call in calls:
        # Collect response time for average response time metric
        if call.response_timestamp:
            response_time = call.response_timestamp - call.received_timestamp
            group = call.call_type_group if call.call_type_group else "Other"
            #group = call.call_type if call.call_type else "Other"

            if group in avg_resp_time_data:
                avg_resp_time_data[group]["avg_time"] += response_time
                avg_resp_time_data[group]["total_calls"] += 1
            else:
                avg_resp_time_data[group] = {
                    "avg_time": response_time,
                    "total_calls": 1
                }
        
        # Collect received_timestamp data for avg_calls_per_hour metric
        if call.received_timestamp:
            received_time = call.received_timestamp
            hour = received_time.hour
            day_key = received_time.strftime("%m/%d")

            if day_key not in days:
                total_days += 1
                days.append(day_key)
            
            avg_calls_per_hour[hour] += 1

        # Collect unit type data for unit type distribution metric
        if call.unit_type:
            unit_type = call.unit_type

            if unit_type in unit_type_distrib:
                unit_type_distrib[unit_type] += 1
            else:
                unit_type_distrib[unit_type] = 1

        # Collect locations
        if call.location:
            data["locations"].append(call.location)
        
    # Calculate average response time per call type group
    for group in avg_resp_time_data:
        avg_resp_time_data[group]["avg_time"] = (avg_resp_time_data[group]["avg_time"]
            / avg_resp_time_data[group]["total_calls"])
        data["avg_response_time"]["groups"].append(group)

        seconds = avg_resp_time_data[group]["avg_time"].seconds
        data["avg_response_time"]["data"].append(
            round(seconds / 60, 2)
        )

    # Calculate average calls per hour
    for hour in avg_calls_per_hour:
        data["avg_calls_per_hour"]["data"].append(round(avg_calls_per_hour[hour]
             / total_days, 2))

    # Create labels for average calls per hour
    for i in range(0, 24):
        hour = "{0}:00".format("0" + str(i) if i < 10 else i)
        data["avg_calls_per_hour"]["labels"].append(hour)

    for unit_type in unit_type_distrib:
        data["unit_type_distrib"]["labels"] = list(unit_type_distrib.keys())
        data["unit_type_distrib"]["data"] = [x / total_calls for x in unit_type_distrib.values()]

    return JsonResponse(data, safe=False)