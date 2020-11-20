#!/usr/bin/env python3.7.x
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 14 17:56:43 2020

@author: zengshiqin, Beili Li
"""


import networkx as nx
import numpy as np
import pandas as pd
import json
import geopandas as gpd
import random
import os


def geocalc(lat0, lon0, lat1, lon1):
    """Return the distance (in km) between two points
    in geographical coordinates."""
    EARTH_R = 6372.8  ##km
    lat0 = np.radians(lat0)
    lon0 = np.radians(lon0)
    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    dlon = lon0 - lon1
    y = np.sqrt((np.cos(lat1) * np.sin(dlon)) ** 2 +
                (np.cos(lat0) * np.sin(lat1) - np.sin(lat0) *
                 np.cos(lat1) * np.cos(dlon)) ** 2)
    x = np.sin(lat0) * np.sin(lat1) + \
        np.cos(lat0) * np.cos(lat1) * np.cos(dlon)
    c = np.arctan2(y, x)
    return EARTH_R * c


def get_path(n0, n1, sg):
    """If n0 and n1 are connected nodes in the graph,
    this function returns an array of point
    coordinates along the road linking these two
    nodes."""
    return np.array(json.loads(sg[n0][n1]['Json'])
                    ['coordinates'])


def get_path_length(path):
    return np.sum(geocalc(path[1:, 1], path[1:, 0],
                          path[:-1, 1], path[:-1, 0]))


def shortest_road(shapefile, pos0, pos1):
    # load in the Shapefile dataset with NetworkX
    # returns a graph with each node is a geographical location and
    # each edge is info about the road linknig the two nodes
    g = nx.read_shp(shapefile)

    # Here, we take the largest connected subgraph
    sgs = list(nx.connected_component_subgraphs(g.to_undirected()))
    i = np.argmax([len(sg) for sg in sgs])
    sg = sgs[i]

    # Compute the length of the road segments.

    for n0, n1 in sg.edges:
        path = get_path(n0, n1, sg)
        distance = get_path_length(path)
        sg.edges[n0, n1]['distance_km'] = distance
    nodes = np.array(sg.nodes())

    # Get the closest nodes in the graph.
    pos0_i = np.argmin(
        np.sum((nodes[:, ::-1] - pos0) ** 2, axis=1))
    pos1_i = np.argmin(
        np.sum((nodes[:, ::-1] - pos1) ** 2, axis=1))

    # Compute the shortest path.
    path = nx.shortest_path(
        sg,
        source=tuple(nodes[pos0_i]),
        target=tuple(nodes[pos1_i]),
        weight='distance_km')

    roads = pd.DataFrame(
        [sg.edges[path[i], path[i + 1]]
         for i in range(len(path) - 1)],
        columns=['@id', 'name',
                 'highway', 'maxspeed', 'distance_km', "Json"])
    return roads


def shapefile_genrate(shapefile, roads, num, drop_num):
    df = gpd.read_file(shapefile)
    for i in range(num):
        way_num = len(roads)
        r = random.randint(0, way_num - drop_num)
        road_filter = roads.loc[r, :]
        filter_way = road_filter['@id']
        df_filtered = df[df['@id'] != filter_way]
        filename = "road" + str(i) + ".shp"
        df_filtered.to_file(os.path.join('demo',filename))


def road_generate(pos0, pos1, num):
    diff_roads = []
    for i in range(num):
        shapefile = "road" + str(i) + ".shp"
        shapefile = os.path.join('demo',shapefile)
        road = shortest_road(shapefile, pos0, pos1)
        diff_roads.append(road)
    return diff_roads


# add crime cost
def add_crime_cost(path_df, path):
    """

    :param path_df: the route plan
    :param path: crime cost data
    :return: route route ways with crime cost
    """
    crime_df = pd.read_csv(path)
    crime_df = crime_df[['id', 'crime_count']]
    path_df = path_df.rename(columns={"@id": 'id'})
    new = pd.merge(path_df, crime_df, on='id', how='left')
    new['crime_count'] = new['crime_count'].replace(np.nan, 0)
    return new


def label_road_type(road):
    """
    Labels the road type as 'highway' ,'combined', or 'city'
    Input: original road type in str
    Output: labeled road type
    """
    # Define road type labels
    road_types = {
        'combined': ['primary', 'primary_link', 'secondary', 'secondary_link'],
        'highway': ['motorway', 'motorway_link'],
        'city': ['tertiary', 'tertiary_link', 'trunk', 'trunk_link', 'unclassified'],
    }

    if road in road_types['highway']:
        return 'highway'
    elif road in road_types['combined']:
        return 'combined'
    elif road in road_types['city']:
        return 'city'
    else:
        print("Road '", road, "' is not recognized, labeled as 'city'")
        return 'city'


def energy_consumption(df, df_EV, vehicle, cold_weather=False):
    """ 
    Adds a column of energy consumption and a column of labeled road type to original dataframe

    Input:
        df -> original dataframe
        df_EV -> EV dataframe from EV database with vehicle energy rate data
        vehicle -> string of vehicle name
        cold_weather -> boolean indicating weather condition. True for mild, False for cold

    Output: 
        updated dataframe
    """  # Lookup energy rate
    df_EV_sub = df_EV.loc[df_EV.iloc[:, 0] == vehicle,]
    if cold_weather:
        df_EV_sub = df_EV_sub.iloc[:, 1:4]
    else:
        df_EV_sub = df_EV_sub.iloc[:, 4:7]
    energy_rate = {
        'city': df_EV_sub.iloc[0, 0],
        'highway': df_EV_sub.iloc[0, 1],
        'combined': df_EV_sub.iloc[0, 2],
    }

    # Label road types
    df['road_type_label'] = df['highway'].apply(label_road_type)

    # Compute energy consumption in kWh
    for i in range(0, len(df)):
        df.loc[i, 'energy_consumption[kWh]'] = df.loc[i, 'distance_km'] / energy_rate[
            df.loc[i, 'road_type_label']] * 1000

    return df


def speed_limit(road, speed):
    length = len(road)
    for i in range(length):
        road_type = road.loc[i, 'highway']
        road.loc[i, 'maxspeed'] = speed[road_type]
        road.loc[i, "time"] = road.loc[i, 'distance_km'] / road.loc[i, 'maxspeed']
    return road


def final_score(crime_path, EV_path, vehicle_name, num, diff_roads):
    scores = []
    speed = {'motorway': 1.341, "motorway_link": 0.536,
             "primary": 1.073, "primary_link": 0.939,
             "secondary": 0.939, "secondary_link": 1.0729,
             "tertiary": 0.939, "tertiary_link": 0.939,
             "trunk": 1.073, "trunk_link": 1.073,
             "unclassified": 0.604}
    for i in range(num + 1):
        ##
        crime_add = add_crime_cost(diff_roads[i], crime_path)
        ##
        EV_data = pd.read_csv(EV_path)

        energy_add = energy_consumption(crime_add, EV_data, vehicle_name, cold_weather=False)
        speed_add = speed_limit(energy_add, speed)
        # save the route with cost
        if i != len(diff_roads) - 1:
            path_name = 'path_cost' + str(i) + '.csv'
            path_name= os.path.join('demo', path_name)
            speed_add.to_csv(path_name, index=False)
        else:
            path_name = 'shortest' + '.csv'
            path_name = os.path.join('demo', path_name)
            speed_add.to_csv(path_name, index=False)

        total_energy = speed_add['energy_consumption[kWh]'].sum()
        total_time = speed_add['time'].sum()
        total_crime = speed_add['crime_count'].sum()
        scores.append([total_crime, total_time, total_energy])
    return scores


# Creating pair-wise comparison matrix of features
def importance_array(safety_index, time_index, energy_index):
    # Creating default matrix of ones
    A = np.ones([3, 3])
    A[0, 1] = safety_index / time_index
    A[0, 2] = safety_index / energy_index
    A[1, 2] = time_index / energy_index
    # Running a for loop to take input from user and populate the upper triangular elements
    for i in range(0, 3):
        for j in range(0, 3):
            if i < j:
                A[i, j] = float(A[i, j])  # Upper triangular elements
                A[j, i] = 1 / float(A[i, j])  # Lower triangular elements
    col_sum = np.sum(A, axis=0)
    A = A / col_sum
    importance = np.average(A, axis=1)
    return importance


# Creating pair-wise comparison matrix of iternatives
def scores_array(candidates):
    # Creating default matrix of ones
    candidates_num = len(candidates)
    B = np.ones([candidates_num, candidates_num])
    # Running a for loop to take input from user and populate the upper triangular elements
    for i in range(0, candidates_num):
        for j in range(0, candidates_num):
            if i < j:
                B[i, j] = candidates[i] / candidates[j]  # Upper triangular elements
                B[j, i] = 1 / float(B[i, j])  # Lower triangular elements
    col_sum = np.sum(B, axis=0)
    B = B / col_sum
    scores = np.average(B, axis=1)
    return scores


def generate_one_optimal_route(pos0, pos1, num_road, drop_num, shapefile_path,
                               crime_path, EV_path, vehicle_name, safety_score, time_score, energy_score):
    """

    :param pos0: starting point
    :param pos1: end point
    :param num_road: how many different candidate routes from pos0 tp pos1
    :param drop_num: drop how many ways drop from shortest path
    :param shapefile_path: path of shapefile
    :param crime_path: crime cost db path
    :param EV_path: EV cost db path
    :param vehicle_name: car model type input by user
    :param safety_score: safety preference input by user
    :param time_score: time preference socre input by user
    :param energy_score: energy preference score input by user
    :return: optimal index number
    """


    # roads is the shortest_road
    roads = shortest_road(shapefile_path, pos0, pos1)
    shapefile_genrate(shapefile_path, roads, num_road, drop_num)

    # other candidate roads
    diff_roads = road_generate(pos0, pos1, num_road)
    diff_roads.append(roads)

    # cal score for all candidate roads
    scores1 = final_score(crime_path, EV_path, vehicle_name, num_road, diff_roads)
    scores = np.array(scores1)
    importance = importance_array(safety_score, time_score, energy_score)
    safety_nor = scores_array(scores[:, 0]) * importance[0]
    time_nor = scores_array(scores[:, 1]) * importance[1]
    energy_nor = scores_array(scores[:, 2]) * importance[2]

    # score for each candidate route
    total_score = safety_nor + time_nor + energy_nor

    # the index of potimal path
    path_index = np.argmin(total_score, axis=0)
    print(total_score)
    return path_index


def save_road_json(road):
  """

  :param i: index of route plans such as 1,2,3..
  :return: dic of route
  """

  geojson = {"type": "FeatureCollection", "features": []}
  for _, row in road.iterrows():
    feature = {"type": "Feature", "geometry": json.loads(row['Json']), "properties": {'id': row['id'],
                                  'Distance(mile)': row['distance_km'] * 0.621371,
                                   'Crime_count': row['crime_count'],
                                   'Energy': row['energy_consumption[kWh]'],
                                   'Time(minutes)': row['time']}}

    geojson['features'].append(feature)

  op_energy = round(road['energy_consumption[kWh]'].sum(), 2)
  op_time = round(road['time'].sum(), 2)
  op_crime = round(road['crime_count'].sum(), 2)
  op_dis = round(road['distance_km'].sum() * 0.621371, 2)

  return {'geo': geojson,
          'attr': {'Time_minute': op_time, 'Distance_mile': op_dis, 'Crime_counts(annual)': op_crime, 'Energy_Kwh': op_energy}}

