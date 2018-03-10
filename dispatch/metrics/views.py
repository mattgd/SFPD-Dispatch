from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse

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
    data = {}

    return JsonResponse(data)