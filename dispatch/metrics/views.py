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
            "data": []
        }
    }
    calls = Call.objects.all()
    avg_resp_time_data = {}
    
    avg_calls_per_hour = {}
    for i in range(0, 24):
        avg_calls_per_hour[i] = 0
    days = []

    total_days = 0

    for call in calls:
        # Collect average response time data
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
                
            """
            data.append(
                {
                    "x": call.call_type_group,
                    "y": call.response_timestamp
                }
            )
            """
        
        if call.received_timestamp:
            received_time = call.received_timestamp
            hour = received_time.hour
            day_key = received_time.strftime("%m/%d")

            if day_key not in days:
                total_days += 1
                days.append(day_key)
            
            avg_calls_per_hour[hour] += 1
            

    for group in avg_resp_time_data:
        avg_resp_time_data[group]["avg_time"] = (avg_resp_time_data[group]["avg_time"]
            / avg_resp_time_data[group]["total_calls"])
        data["avg_response_time"]["groups"].append(group)

        """
        data["avg_response_time"]["data"].append(
            {
                "x": str(avg_resp_time_data[group]["avg_time"]),
                "y": avg_resp_time_data[group]["total_calls"]
            }
        )
        """
        seconds = avg_resp_time_data[group]["avg_time"].seconds
        data["avg_response_time"]["data"].append(
            round(seconds / 60, 2)
        )  

    # Calculate average calls per hour
    for hour in avg_calls_per_hour:
        data["avg_calls_per_hour"]["data"].append(round(avg_calls_per_hour[hour]
             / total_days, 2))

    data["avg_calls_per_hour"]["labels"] = [
        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM",
        "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM",
        "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
    ]

    return JsonResponse(data, safe=False)