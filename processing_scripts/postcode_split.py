import csv
import json

postcodeFile = 'data/ONSPD_FEB_2021_UK.csv'
wardsFile = '../geometry/wards_simplified.geojson';
laFile = '../geometry/Local_Authority_Districts_(December_2019)_Boundaries_UK_BUC.geojson';

processedData = {}

#process each postcode in csv and join IMD data
wardLookup = {}
with open(wardsFile) as jsonfile:
	wards = json.load(jsonfile);
	for ward in wards['features']:
		code = ward['properties']['WD21CD']
		name = ward['properties']['WD21NM']

		wardLookup[code] = name

laLookup = {}
with open(laFile) as jsonfile:
	las = json.load(jsonfile);
	for la in las['features']:
		code = la['properties']['lad19cd']
		name = la['properties']['lad19nm']

		laLookup[code] = name
print(laLookup)

print('Processing Postcodes')
with open(postcodeFile) as csvfile:
	csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')

	for row in csvreader:

			#check if in England or not
			#if(row[49] not in ['N99999999','S99999999','W99999999','stp','','L99999999','M99999999']):
		if(row[49] not in ['stp']):
			postcodeStart = row[2].split(' ')[0] + row[2].split(' ')[1][0]
			lsoa = row[34]

    		#add postcodestart to processed data if not already there
			if postcodeStart not in processedData:
				processedData[postcodeStart] = {}

			#clean postcodes by removing spaces
			fullCode = row[0].replace(' ','')
			if row[8] in wardLookup:
				wardName = wardLookup[row[8]]
				laName = laLookup[row[7]]
				#add full postcode with data
				processedData[postcodeStart][fullCode] = [row[42],row[43],row[7],laName,row[8],wardName]

print('Saving New Files')
#save one files for each postcode start value
for key in processedData:
	file = key+'.json'
	print(file)
	with open('../processed_data/'+file, 'w') as outfile:
		json.dump(processedData[key], outfile)

