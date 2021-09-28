import csv
import json

postcodeFile = 'data/ONSPD_FEB_2021_UK.csv'
wardsFile = '../geometry/wards_simplified.geojson';
laFile = '../geometry/Local_Authority_Districts_(December_2019)_Boundaries_UK_BUC.geojson';

processedData = {}
wardsProcessed = []

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
	i=0
	for row in csvreader:

			#check if in England or not
			#if(row[49] not in ['N99999999','S99999999','W99999999','stp','','L99999999','M99999999']):
		if(row[49] not in ['stp']):
			#postcodeStart = row[2].split(' ')[0] + row[2].split(' ')[1][0]
			#lsoa = row[34]

    		#add postcodestart to processed data if not already there
			#if postcodeStart not in processedData:
			#	processedData[postcodeStart] = {}

			#clean postcodes by removing spaces
			fullCode = row[0].replace(' ','')
			if row[8] not in wardsProcessed and row[8] in wardLookup:
				i = i+1
				print(i)
				wardName = wardLookup[row[8]]
				laName = laLookup[row[7]]
				wardsProcessed.append(row[8]) 
				#add full postcode with data
				if row[7] in processedData:
					processedData[row[7]].append([wardName,laName,row[8],row[7]])
				else:
					processedData[row[7]] = [['Ward Name','La Name','Ward Code','La Code','Value'],[wardName,laName,row[7],row[8],'']]

print('Saving New Files')
#save one files for each la start value
for key in processedData:
	name = processedData[key][1][1]
	file = name+'.csv'
	print(file)
	with open('../templates/'+file, 'w', newline="") as outfile:
	    writer = csv.writer(outfile)
	    writer.writerows(processedData[key])

