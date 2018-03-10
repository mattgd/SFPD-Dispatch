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
        }
    }
    calls = Call.objects.all()
    avg_resp_time_data = {}

    for call in calls:
        if call.response_timestamp:
            response_time = call.response_timestamp - call.received_timestamp
            group = call.call_type_group if call.call_type_group else "Other"

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

    for group in avg_resp_time_data:
        avg_resp_time_data[group]["avg_time"] = (avg_resp_time_data[group]["avg_time"]
            / avg_resp_time_data[group]["total_calls"])
        data["avg_response_time"]["groups"].append(group)

        #print(str(avg_resp_time_data[group]["avg_time"]))

        """
        data["avg_response_time"]["data"].append(
            {
                "x": str(avg_resp_time_data[group]["avg_time"]),
                "y": avg_resp_time_data[group]["total_calls"]
            }
        )
        """
        print(str(avg_resp_time_data[group]["avg_time"]))
        print(avg_resp_time_data[group]["avg_time"].seconds)
        seconds = avg_resp_time_data[group]["avg_time"].seconds
        data["avg_response_time"]["data"].append(
            round(seconds / 60, 2)
        )  


    return JsonResponse(data, safe=False)