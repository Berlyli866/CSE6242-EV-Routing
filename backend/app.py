from flask import Flask, jsonify,request
from flask_cors import CORS
from optimal_route_generate import *
import json
import geojson

from optimal_route_generate import save_road_json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

## return result.json attr
## time: minutes
## energy: kwh
## distance:mile
## crime_count:annual average counts

@app.route("/", methods = ["GET", "POST"])
def getCalRoutes():
    ### post sample:
    # source = {"O": {"lat": "33.788279", "lon": "-84.374004"},
    # "D": {"lat": "33.788279", "lon": "-84.374004"},
    # "timePrefer":5,
    # "energyPrefer":5,
    # "crimePrefer":5,
    # "carModel":"Tesla Model S"}


    # orginal = source["O"]
    # destination = source["D"]

    ## user input
    if request.method == 'POST':

        source = request.get_json()

                #for dynamic interactive
        if "O" in source:

            ##user input paras

            pos0 = (source["O"]['lat'], source["O"]['lon'])
            pos1 = (source["D"]['lat'], source["D"]['lon'])
            safety_score = source["crimePrefer"]
            time_score = source["timePrefer"]
            energy_score = source['energyPrefer']
            vehicle_name = source["carModel"]

            # test pars
            num_road = 5
            drop_num = 2
            shapefile = 'testData/Atlanta_small.shp'
            crime_path = "testData/crime_link_way_new.csv"
            EV_path = "testData/EV data.csv"
            print(pos1)
            print(pos0)
            print(safety_score)
            print(time_score)
            print(energy_score)
            print(vehicle_name)


            # import from other py module
            path_index = generate_one_optimal_route(pos0, pos1, num_road, drop_num, shapefile,
                                                    crime_path, EV_path, vehicle_name, safety_score, time_score,
                                                    energy_score)
            print(path_index)

            if path_index != num_road:
                pa = "path_cost" + str(path_index) + ".csv"
                path_name = os.path.join('demo', pa)
                optimal = pd.read_csv(path_name)
                shortest = pd.read_csv(os.path.join('demo', "shortest.csv"))

                # save optimal as json
                optimal_geojson = save_road_json(optimal)


                # save shortest as json
                shortest_geojson = save_road_json(shortest)



            else:
                print("optimal, shortest are same")
                optimal = pd.read_csv(os.path.join('demo', "shortest.csv"))
                shortest = pd.read_csv(os.path.join('demo', "shortest.csv"))

                # save optimal as json
                optimal_geojson = save_road_json(optimal)


                # save shortest json
                shortest_geojson = save_road_json(shortest)



            re = {}
            re['Shortest'] = shortest_geojson
            re['Optimal'] = optimal_geojson



            with open(os.path.join('demo', 'result.json'), 'w') as fp:
                json.dump(re, fp)


            #the output is an dictionary with multiple geojsons
            return  json.dumps(re)



        ### post sample: {"demo1":0,"demo2":1}
        # for demos
        else:

            if source["demo1"] == 1:
                # just for show the format of the output
                # under this case shortest,optimal are same route
                with open("demo/case_diff.json") as file:
                    case1 = geojson.load(file)


                #the output is an dictionary with multiple geojsons
                return json.dumps({
                    "O": {"lat": "33.772890000000075", "lon": "-84.39725999999996"},
                    "D": {"lat": "33.78265418102113", "lon": "-84.3977220293286"},
                    "timePrefer":6,
                    "energyPrefer":6,
                    "crimePrefer":10,
                    "carModel":"Tesla Model S Long Range",
                    'Shortest':case1['Optimal'],
                    'Optimal':case1['Shortest']
                    })
            elif source["demo2"] == 1:
                # just for show the format of the output
                #  this case optimal and shortest path are different routes
                with open("demo/case_diff2.json") as file:
                    case2 = geojson.load(file)

                #the output is an dictionary with multiple geojsons
                return json.dumps({
                    "O": {"lat": "33.819330000000036", "lon": "-84.44837999999999"},
                    "D": {"lat": "33.771330000000034", "lon": "-84.39440999999994"},
                    "timePrefer":3,
                    "energyPrefer":10,
                    "crimePrefer":5,
                    "carModel":"Tesla Model S Long Range",
                    'Shortest':case2['Optimal'],
                    'Optimal':case2['Shortest']
                   })


            else:
                return jsonify(hello="yoyo")

    else:
        return jsonify(hello="yoyo")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
