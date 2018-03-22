"""dispatch URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url
from metrics.views import (AverageCallsPerHour, AverageResponseTime,
    BattalionDistribution, Home, Heatmaps, IncidentMetrics, NeighborhoodTrends)
from api.views import (AddressFrequency, Battalions, NearbyView,
    LongestDispatch, Neighborhoods, SafestNeighborhoods)

urlpatterns = [
    # Admin view (disabled)
    #path('admin/', admin.site.urls),

    # Page views
    url(r'^$', Home.as_view(), name='home'),
    url(r'^heatmaps$', Heatmaps.as_view(), name='heatmaps'),
    url(r'^incidents$', IncidentMetrics.as_view(), name='incident-metrics'),

    # API views
    url(r'^api/calls/address-frequency$', AddressFrequency.as_view(), name='api-address-frequency'),
    url(r'^api/calls/nearby$', NearbyView.as_view(), name='api-calls-nearby'),
    url(r'^api/calls/longest-dispatch$', LongestDispatch.as_view(), name='api-calls-longest-dispatch'),
    url(r'^api/calls/safest-neighborhoods$', SafestNeighborhoods.as_view(), name='api-calls-safest-neighborhoods'),
    url(r'^api/calls/neighborhoods$', Neighborhoods.as_view(), name='api-calls-neighborhoods'),
    url(r'^api/calls/battalions$', Battalions.as_view(), name='api-calls-battalions'),

    # Metrics chart views
    url(r'^api/metrics/calls-per-hour$', AverageCallsPerHour.as_view(), name='metrics-calls-per-hour'),
    url(r'^api/metrics/battalion-dist$', BattalionDistribution.as_view(), name='metrics-battalion-dist'),
    url(r'^api/metrics/group-response-time$', AverageResponseTime.as_view(), name='metrics-group-response-time'),
    url(r'^api/metrics/neighborhood-trends$', NeighborhoodTrends.as_view(), name='api-calls-neighborhood-trends')
]
