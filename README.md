# EV Routing Project

## DESCRIPTION
This project aims to find the optimal route for Electric vehicle drivers based on the customized preferences, inclduing time, safety and energy consumption. The developed package has three main components to achieve this objective, including database and API, frontend and backend. The database and API was developed based on an open source project postgrest-starter-kit. The frontend is a react application hosted by node.js. It was developed based on the base project provided by facebook. The backend is a Flask applicaiton which also provides an API to provide the data processing and analysis support for the project. It would fetch the data from the database, generate the results and then visualize the results on the frontend. 

### Open source project used
* [postgrest-starter-kit](https://github.com/subzerocloud/postgrest-starter-kit)
* [create-react-app](https://github.com/facebook/create-react-app)

### Layout
```bash
.
├── postgrest-starter-kit         # PostgreSQL and postgrest REST API
│   └── db                        # Database 
│       └── src                   # Schema and data definition
│           ├── api               # Api setting for endpoints
│           ├── data              # schema setting for tables
│           ├── libs              # 
│           ├── authorization     # authorization setting for different roles
│           ├── sample_data       # data for development version
│           └── init.sql          # initial database based on the settings 
├── frontend                      # React application hosted by node.js
│   ├── package-lock.json         # 
│   ├── package.json              # Application settings 
│   ├── public                    # Components face to public
│   ├── Dockerfile                # Docker file for starting the frontend service
│   └── src                       # Code for component define and customization
├── backend                       # Flask backend
│   ├── app.py                    # API end point setting
│   ├── requirements.txt          # Libraries required for Flask API
│   ├── demo                      # Save demo file                    
│   ├── testData                  # Used data in backend
│   ├── optimal_route_generate.py # Build in function to generate route plan
│   └── Dockerfile
├── docker-compose.yml            # Define Docker services
└── .env                          # Project environment setting

```

## INSTALLATION 

### Prerequisites
* [Docker](https://www.docker.com)
* [Python] (Install the packages in requirements.txt)

Download thos repo to the local drive and navigate to the root directory of the repo. Then, 
### Start the postgreSQL database, postgrest API and react-nodejs frontend
```bash
docker-compose up -d 
```
### Start the backend (Flask API)
```bash
cd backend
python app.py
```
### Stop the application 
```bash
docker-compose down
```
## EXECUTION 

### Run the application
The applicaiton will become avaiable at :
```bash
http://localhost/
```

### Run API calls
#### Sample Flask API calls
Call backend to get the shortest and optimal route based on the user's input, including origin, destination, prefered factors and car model type.\
Try simply request from here:
```bash
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{
              "O": {"lat": "33.767466", "lon": "-84.414590"},
              "D": {"lat": "33.769994", "lon": "-84.414494"},
              "timePrefer":5,
              "energyPrefer":5,
              "crimePrefer":5,
              "carModel":"Tesla Model S"
            }' \
     http://localhost:5000 
```
Sample return should be as follows: 
```
{'Shortest':{
    'geo': {"type": "FeatureCollection","features": [
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.41459, 33.767466], [-84.414522, 33.768145]]}, "properties": {"id": "way/9238877", "Distance(mile)": 0.1871916975276935, "Crime_count": 0.0, "Energy": 1.5370200432008292, "Time(minutes)": 0.5620446426629898}}}, 
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.414512, 33.768325], [-84.414494, 33.769994]]}, "properties": {"id": "way/337901434", "Distance(mile)": 0.11199452543000214, "Crime_count": 0.0, "Energy": 0.9195804759941976, "Time(minutes)": 0.1344054983556023}}
    ]},
    'attr':{
      'Time': '20 mins',
      'Distance': '50 miles'
    }
  },
  'Optimal':{
    'geo':{"type": "FeatureCollection","features": [
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.41459, 33.767466], [-84.414522, 33.768145]]}, "properties": {"id": "way/9269255", "Distance(mile)": 0.05860383368133388, "Crime_count": 0.0, "Energy": 0.5857997347233885, "Time(minutes)": 0.08789725749344414}}, 
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.414512, 33.768325], [-84.414494, 33.769994]]}, "properties": {"id": "way/303454539", "Distance(mile)": 0.0766809582980148, "Crime_count": 2.0, "Energy": 0.7664973809319207, "Time(minutes)": 0.1150103246319098}}
    ]},
    'attr':{
      'Time': '20 mins',
      'Distance': '50 miles'
    }
  }
}
```
Call backend to get the demo with details, including origin, destination, prefered factors, car model type and corresponding shortest and optimal route.\
Try simply request from here:
```bash
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"demo1":0,"demo2":1}' \
     http://localhost:5000 
```
Sample return should be as follows: 
```
{ "O": {"lat": "33.788279", "lon": "-84.374004"},
  "D": {"lat": "33.788279", "lon": "-84.374004"},
  "timePrefer":5,
  "energyPrefer":5,
  "crimePrefer":5,
  "carModel":"Tesla Model S",
  'Shortest':{
    'geo': {"type": "FeatureCollection","features": [
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.41459, 33.767466], [-84.414522, 33.768145]]}, "properties": {"id": "way/9238877", "Distance(mile)": 0.1871916975276935, "Crime_count": 0.0, "Energy": 1.5370200432008292, "Time(minutes)": 0.5620446426629898}}, 
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.414512, 33.768325], [-84.414494, 33.769994]]}, "properties": {"id": "way/169925547", "Distance(mile)": 0.04949479898993022, "Crime_count": 1.0, "Energy": 0.4947464747126869, "Time(minutes)": 0.07423502556266785}}
    ]},
    'attr':{
      'Time': '20 mins',
      'Distance': '50 miles'
    }
  },
  'Optimal':{
    'geo':{"type": "FeatureCollection","features": [
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.41459, 33.767466], [-84.414522, 33.768145]]}, "properties": {"id": "way/303454543", "Distance(mile)": 0.1495918103341036, "Crime_count": 7.67, "Energy": 1.4953090490122831, "Time(minutes)": 0.22436603624508625}}, 
      {"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[-84.414512, 33.768325], [-84.414494, 33.769994]]},  "properties": {"id": "way/9270244", "Distance(mile)": 0.07119290915653441, "Crime_count": 0.0, "Energy": 0.8881698964343703, "Time(minutes)": 0.12201695062836394}}
    ]},
    'attr':{
      'Time': '20 mins',
      'Distance': '50 miles'
    }
  }
}
```

#### Postgrest Rest API
Call postgrest API to get the crime data\
Try simply request from here: 
```bash
http://localhost:3000/evs?select=id,streetid,crime,distance 
 ```
Sample return should be as follows:
```bash
[{"id":1,"streetid":"way/101797829","crime":1,"distance":0.000191817}, 
 {"id":2,"streetid":"way/101797968","crime":10.6,"distance":0.002257247}, 
 {"id":3,"streetid":"way/107533616","crime":2,"distance":0.000766886}, 
 {"id":4,"streetid":"way/107533620","crime":4,"distance":0.000452658}, 
 {"id":5,"streetid":"way/111663207","crime":176.22,"distance":0.00042042}, 
 {"id":6,"streetid":"way/111877312","crime":1,"distance":0.000192981}, ]
 ```
Call postgrest API to get the list of the car model types\
Try simply request from here: 
```bash
http://localhost:3000/evtypes?select=id,evtype 
 ```
Sample return should be as follows:
```bash
[{"id":1,"evtype":"Volkswagen ID.3 Pure"}, 
 {"id":2,"evtype":"Volkswagen ID.4 1st"}, 
 {"id":3,"evtype":"Lucid Air "}, 
 {"id":4,"evtype":"Skoda Enyaq iV 50"}, 
 {"id":5,"evtype":"Tesla Model 3 Long Range Dual Motor"}, 
 {"id":6,"evtype":"Honda e "}, ]
 ```

## DEMO VIDEO 

![](demo.gif)
