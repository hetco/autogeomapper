import csv
import json

wardsFile = '../geometry/wards_simplified.geojson';


wardLookup = {}
with open(wardsFile) as jsonfile:
	wards = json.load(jsonfile);
	for ward in wards['features']:
		code = ward['properties']['WD21CD'].lower()
		name = ward['properties']['WD21NM'].lower()
		firstLetter = name[0]

		if firstLetter in wardLookup:
			wardLookup[firstLetter].append([name,code])
		else:
			wardLookup[firstLetter] = [[name,code]]

for letter in wardLookup:
	wardLookup[letter].sort()

with open('wardlookup.json', 'w') as f:
    json.dump(wardLookup, f)

