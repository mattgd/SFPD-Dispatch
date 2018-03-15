from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.db.models import Count
from metrics.models import Call
from geopy.geocoders import Nominatim
from django.contrib.gis import geos
from django.contrib.gis.measure import D
from datetime import datetime, timedelta

class NearbyView(View):

    def post(self, request):
        response = None
        address = request.POST.get("address")

        if address:
            geolocator = Nominatim(scheme='http')
            location = geolocator.geocode(address)

            if location:
                # Get radius from parameters, or set
                # to 1 mile (1609.34 m) by default
                radius = float(request.POST.get("radius", 1.0)) * 1609.34
                #limit = request.POST.get("limit", 50)

                source_location = geos.fromstr('POINT({0} {1})'.format(location.longitude, location.latitude))
                desired_radius = {'m': radius}

                time = request.POST.get("time")
                if time:
                    time = datetime.strptime(time, "%H:%M:%S")

                    delta_hours = request.POST.get("delta_hours", 2)
                    delta_hours = timedelta(hours=delta_hours)

                    time_minus_delta = (time - delta_hours).hour
                    time_plus_delta = (time + delta_hours).hour

                    min_time = min(time_minus_delta, time_plus_delta)
                    max_time = max(time_minus_delta, time_plus_delta)

                    time_range_calls = Call.objects.filter(
                        received_timestamp__hour__gte=min_time,
                                    received_timestamp__hour__lte=max_time)                 

                    nearby_calls = time_range_calls.filter(
                        point__distance_lte=(
                            source_location, D(**desired_radius)))
                    #.distance(source_location).order_by('distance')

                    unit_types = {}
                    for call in nearby_calls:
                        unit_type = call.unit_type
                        
                        if unit_type in unit_types:
                            unit_types[unit_type] += 1
                        else:
                            unit_types[unit_type] = 1

                    # Calculate the most common call for the given address
                    # and time range to be returned via JSON
                    max_type = None
                    max_type_calls = 0
                    for unit_type in unit_types:
                        call_count = unit_types[unit_type]
                        if call_count > max_type_calls:
                            max_type = unit_type
                            max_type_calls = call_count

                    response = JsonResponse(
                        {
                            'status': 'true',
                            'data': {
                                "unit_type_match": max_type,
                                "unit_type_match_count": max_type_calls
                            }
                        }
                    )
                else:
                    response = JsonResponse(
                    {
                        'status': 'false',
                        'message': 'No time provided.'
                    },
                    status=400
                )
            else:
                response = JsonResponse(
                    {
                        'status': 'false',
                        'message': 'Invalid address.'
                    },
                    status=404
                )
        else:
            response = JsonResponse(
                {
                    'status': 'false',
                    'message': 'No address provided.'
                },
                status=400
            )

        return response

class LongestDispatch(View):

    def get(self, request):
        calls = Call.objects.extra(
            select={
                'dispatch_time': 'dispatch_timestamp - received_timestamp'
            }
        ).order_by('-dispatch_time')[:250]

        parsed_calls = []
        for call in calls:
            parsed_calls.append(
                {
                    "call_number": call.call_number,
                    "address": call.address,
                    "lat": call.latitude,
                    "lng": call.longitude,
                    "dispatch_time": str(call.dispatch_time),
                    "call_type": call.call_type,
                    "count": 1
                }
            )

        return JsonResponse(
            {
                'status': 'true',
                'data': parsed_calls
            }
        )

class AddressFrequency(View):

    def get(self, request):
        """
        Retrieves the frequency of all addresses in the calls database.
        """
        cutoff_value = request.GET.get('cutoff_value', 4)
        addresses = Call.objects.values('address', 'latitude', 'longitude').annotate(count=Count('address')).order_by('-count')
        data = []

        for address in addresses:
            count = address["count"]
            
            if count >= cutoff_value:
                data.append(
                    {
                        "address": address["address"],
                        "count": count,
                        "lat": address["latitude"],
                        "lng": address["longitude"]
                    }
                )

        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

class AllCalls(View):

    def get(self, request):
        """
        Returns all Calls in the database.
        """
        calls = Call.objects.all()

        print()
        data = []

        for call in calls:
            fields = call.__dict__
            call_data = {}
            
            for field, value in fields.items():
                if field != '_state' and field != 'point':
                    call_data[field] = value

            data.append(call_data)

        return JsonResponse(
            {
                'status': 'true',
                'calls': data
            }
        )