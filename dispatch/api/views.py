from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from django.db.models import Avg, Count, TimeField, F
from django.db.models.functions import Cast, TruncDate
from metrics.models import Call
from geopy.geocoders import Nominatim
from django.contrib.gis import geos
from django.contrib.gis.measure import D
from datetime import datetime, timedelta

class NearbyView(View):

    def parse_timestamp(self, text):
        """
        Format the time accepting multiple formats.
        Returns the parsed datetime if valid and raise a ValueError if invalid.
        """
        valid_formats = [
            '%H:%M:%S %p', '%H:%M:%S', '%H:%M %p', '%H:%M', '%H %p', '%H'
        ]

        for fmt in valid_formats:
            try:
                return datetime.strptime(text, fmt)
            except ValueError:
                pass

        raise ValueError('Invalid timestamp format.')

    def post(self, request):
        """
        Post request receiver function for getting the most-likely dispatch type
        given an address and timestamp. A radius is also provided to adjust the
        accuracy of the result.s
        """
        response = None
        address = request.POST.get("address")

        # Check if an address was provided
        if address:
            # Get location from address
            geolocator = Nominatim(scheme='http')
            location = geolocator.geocode(address)

            if location:
                # Get radius from params, or set to default
                # of 1 mile and convert to meters.
                radius = float(request.POST.get("radius", 1.0)) * 1609.34

                # Parse the source location and radius into the correct format
                source_location = geos.fromstr('POINT({0} {1})'.format(location.longitude, location.latitude))
                desired_radius = {'m': radius}

                # Time parameter for query
                time = request.POST.get("time")

                # Check if time provided
                if time:
                    # Format the time: multiple formats accepts
                    try:
                        time = self.parse_timestamp(time)
                    except ValueError:
                        # Invalid time provided, 400 Bad Request
                        return JsonResponse(
                            {
                                'status': 'false',
                                'message': 'Invalid timestamp provided.'
                            },
                            status=400
                        )

                    delta_hours = request.POST.get("delta_hours", 2)
                    delta_hours = timedelta(hours=delta_hours)

                    time_minus_delta = (time - delta_hours).hour
                    time_plus_delta = (time + delta_hours).hour

                    min_time = min(time_minus_delta, time_plus_delta)
                    max_time = max(time_minus_delta, time_plus_delta)
                    
                    # Get calls in the time range
                    time_range_calls = Call.objects.filter(
                        received_timestamp__hour__gte=min_time,
                                    received_timestamp__hour__lte=max_time)                 

                    # Get the nearby calls and group by unit_type
                    # sorted by the counts in descending order.
                    nearby_calls = time_range_calls.filter(
                        point__distance_lte=(
                            source_location, D(**desired_radius)
                        )
                    ).values(
                        'unit_type'
                    ).annotate(
                        count=Count('unit_type')
                    ).order_by('-count')
                    
                    # Create the results data
                    max_type = nearby_calls[0]["unit_type"] if nearby_calls[0] else None
                    max_type_calls = nearby_calls[0]["count"] if nearby_calls[0] else None

                    # Create JSON response
                    response = JsonResponse(
                        {
                            "status": "true",
                            "data": {
                                "unit_type_match": max_type,
                                "unit_type_match_count": max_type_calls
                            }
                        }
                    )
                else:
                    # No time provided, 400 Bad Request
                    response = JsonResponse(
                    {
                        'status': 'false',
                        'message': 'No time provided.'
                    },
                    status=400
                )
            else:
                # No time provided, 400 Bad Request
                response = JsonResponse(
                    {
                        'status': 'false',
                        'message': 'Invalid address.'
                    },
                    status=400
                )
        else:
            # No address provided, 400 Bad Request
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
        # Get a set of calls grouped by address  
        calls = Call.objects.values('address').annotate(
            count=Count('pk'),
            latitude=Avg('latitude'),
            longitude=Avg('longitude'),
            incidents=Count('incident_number', distinct=True),
            avg_dispatch_time=Avg(F('dispatch_timestamp') - F('received_timestamp'))
        ).order_by('-avg_dispatch_time')[:750]
        
        # Prepare the data for the JSON response
        data = []
        for call in calls:
            data.append(
                {
                    "address": call["address"],
                    "lat": call["latitude"],
                    "lng": call["longitude"],
                    # Convert avg_dispatch_time to a string and remove millis
                    "avg_dispatch_time": str(call["avg_dispatch_time"]).split(".")[0],
                    "incident_count": call["incidents"],
                    "count": call["count"]
                }
            )

        # Return the JSON data
        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

class AddressFrequency(View):

    def get(self, request):
        """
        Retrieves the frequency of all addresses in the calls database.
        """
        # The minimum number of calls necessary for an address to be included
        cutoff_value = request.GET.get('cutoff_value', 4)

        # Gets calls grouped by address and takes an average of the latitude
        # and longitude values for the heatmap. Only addresses with call counts
        # greater than or equal to the cutoff value are included.
        addresses = Call.objects.values('address').annotate(
            count=Count('pk'),
            latitude=Avg('latitude'),
            longitude=Avg('longitude')
        ).filter(count__gte=cutoff_value).order_by('-count')

        # Generate the results list from the query set
        data = []
        for address in addresses:
            data.append(
                {
                    "address": address["address"],
                    "count": address["count"],
                    "lat": address["latitude"],
                    "lng": address["longitude"]
                }
            )

        # Return the JSON data
        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

class SafestNeighborhoods(View):

    def get(self, request):
        """
        Returns JSON representing a list of each neighborhood and the number
        of calls.
        """
        # Excluded call types (non-dangerous)
        excluded_types = [
            "Citizen Assist / Service Call"
        ]

        # Gets calls grouped by neighborhood and sorted by number of calls
        calls = Call.objects.exclude(
            call_type__in=excluded_types
        ).values('neighborhood_district').annotate(
            calls=Count('pk'),
            incidents=Count('incident_number', distinct=True)
        ).order_by('incidents')
        
        # Populates the data list for the JSON response
        data = []
        for call in calls:
            data.append(
                {
                    "neighborhood_district": call["neighborhood_district"],
                    "calls": call["calls"],
                    "incidents": call["incidents"]
                }
            )

        # Return the JSON data
        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

class Neighborhoods(View):

    def get(self, request):
        """
        Returns JSON representing a list of the neighborhoods/districts.
        """
        # Gets list of neighborhoods
        neighborhoods = Call.objects.values('neighborhood_district').distinct().order_by('neighborhood_district')
        
        # Populates the data list for the JSON response
        data = [n["neighborhood_district"] for n in neighborhoods]

        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )

class Battalions(View):

    def get(self, request):
        """
        Returns JSON representing a list of the neighborhoods/districts.
        """
        # Gets list of battalions
        battalions = Call.objects.values('battalion').distinct().order_by('battalion')
        
        # Populates the data list for the JSON response
        data = [b["battalion"] for b in battalions]

        return JsonResponse(
            {
                'status': 'true',
                'data': data
            }
        )