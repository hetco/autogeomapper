import csv
import json

postcodeFile = 'data/ONSPD_FEB_2021_UK.csv'
wardsFile = '../geometry/wards_simplified.geojson';
laFile = '../geometry/Local_Authority_Districts_(December_2019)_Boundaries_UK_BUC.geojson';

processedData = {}
laProcessed = []

laLookup = {}
with open(laFile) as jsonfile:
	las = json.load(jsonfile);
	for la in las['features']:
		code = la['properties']['lad19cd']
		name = la['properties']['lad19nm']

		laProcessed.append([name,code]);

with open('../templates/la.csv', 'w', newline="") as outfile:
    writer = csv.writer(outfile)
    writer.writerows(laProcessed)

