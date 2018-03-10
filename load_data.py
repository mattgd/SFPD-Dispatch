import csv
import json

csv_file = open('data/sfpd_dispatch_data_subset.csv', 'r')
json_file = open('dispatch/metrics/fixtures/sfpd_dispatch_data_subset.json', 'w')

reader = csv.DictReader(csv_file)
headers = reader.fieldnames
count = 1
data = []
for row in reader:
    data.append(
        {
            "model": "metrics.Call",
            "pk": count,
            "fields": row
        }
    )

    count += 1

# Dump and write to file
json.dump(data, json_file, indent=4)