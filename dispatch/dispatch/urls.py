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
from metrics.views import Home, Heatmaps, get_metrics
from api.views import AddressFrequency, AllCalls, NearbyView, LongestDispatch

urlpatterns = [
    # Admin view
    path('admin/', admin.site.urls),

    # Metrics views
    url(r'^$', Home.as_view(), name='home'),
    url(r'^heatmaps$', Heatmaps.as_view(), name='heatmaps'),
    url(r'^api/metrics/$', get_metrics, name='api-metrics'),
    url(r'^api/calls/address-frequency$', AddressFrequency.as_view(), name='api-address-frequency'),
    url(r'^api/calls/nearby$', NearbyView.as_view(), name='api-calls-nearby'),
    url(r'^api/calls/longest-dispatch$', LongestDispatch.as_view(), name='api-calls-longest-dispatch'),
    url(r'^api/calls$', AllCalls.as_view(), name='api-all-calls'),
]
