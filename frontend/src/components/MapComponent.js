import React, { Component } from "react";
import { Map } from 'react-leaflet'
import L from "leaflet";

var esri = require('esri-leaflet');

class MapComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            center:{'long':  -84.388257,'lat':33.760551},
            zoom: 13,
            selectedLayerID:null,
            routesLayer:null,
            layerDict:null,
            group:null,
            routeLayer:L.geoJSON()
        }

    }

    componentDidMount() {

        const { passRefUpward } = this.props

        const { routeLayer } = this.state
 
        passRefUpward(this.mapRef)

        const map = this.mapRef.leafletElement;

        var layer = esri.basemapLayer('Gray');

        map.addLayer(layer);

        var layerLabels = esri.basemapLayer('Gray' + 'Labels');
        map.addLayer(layerLabels);
        
        this.setState({ group:routeLayer.addTo(map)})
    }

    setSelectedLayerID = (selectedLayerIDR) => {
        this.setState({ selectedLayerID:selectedLayerIDR})
    }

    setRoutesLayer = ( layer) =>{
        console.log(layer)
        this.setState({ routesLayer:layer})
    }

    componentDidUpdate(prevProps, prevState) {
        const { calRoutes,updateLayerIDDict,updateSelectedLayerID} = this.props;
        const {selectedLayerID,routesLayer,layerDict} = this.state;

        const map = this.mapRef.leafletElement;

        const setSelectedLayerID = this.setSelectedLayerID

        const setRoutesLayer = this.setRoutesLayer

        var routeLayer

        var routeDeSelectedStyle = {
            "weight": 5,
            "opacity": 0.4
        };

        var routeSelectedStyle = {
            "weight": 8,
            "opacity": 0.8
        };

        var layerDictR = {}

        var contentInPopup
       

        if (prevState.routesLayer !== routesLayer) {
            console.log(routesLayer)
            
            
        }

        

        if (prevProps.calRoutes !== calRoutes) {
            // console.log('Map component get OD and route')
            // console.log(origin)
            // console.log(destination)
            // console.log(calRoutes)

            const {routeLayer, group} = this.state;
            var lineStyle
  
            group.clearLayers();

            var layerGroupID = 1

            for (var key in calRoutes){
                // console.log(key)
                layerDictR[layerGroupID] = {'name':key,'attr':calRoutes[key]['attr']}

                var lineGeojson = calRoutes[key]['geo']

                //random color for different routes
                console.log(Math.floor(Math.random()*16777215).toString(16))
                lineStyle = {
                    "color": "#" + Math.floor(Math.random()*16777215).toString(16),
                    "weight": 5,
                    "opacity": 0.5
                };

                routeLayer.addData(lineGeojson)
                

                // var routeLayer = L.geoJSON(lineGeojson, {
                //     style: lineStyle,
                //     onEachFeature: this.routeClickHandler
                // })

                
                group.eachLayer(function(layer) {
                    if(!layer.layerID){
                        layer.setStyle(lineStyle)
                        layer.layerID = layerGroupID;
                    }
                  });

                map.fitBounds(routeLayer.getBounds());

                layerGroupID+=1;

            }

            setRoutesLayer(group)

            group.eachLayer(function(layer) {
                layer.on('click', function (e) {
                    group.eachLayer(function(layers) {
            
                        if(layers.layerID === e.target.layerID){
                            layers.setStyle(routeSelectedStyle);
                        }
                        
                    })
            
                    contentInPopup = ''

                    for (var key in layerDictR[e.target.layerID]['attr']){
                        contentInPopup += '<p>'+ key+': ' + layerDictR[e.target.layerID]['attr'][key]+'</p>'
                    }

                    var infoWindow = L.popup().setLatLng(e.latlng).setContent('<b>'+layerDictR[e.target.layerID]['name']+'</b> <br>' + contentInPopup)
                    map.addLayer(infoWindow)

                    setSelectedLayerID(e.target.layerID)

                    updateSelectedLayerID(e.target.layerID)

                    L.DomEvent.stopPropagation(e);
                })
            })


            this.setState({ layerDict:layerDictR})

            updateLayerIDDict(layerDictR)


        }

        if (prevState.selectedLayerID !== selectedLayerID) {
            
            const {selectedLayerID,routesLayer} = this.state;
            map.addEventListener('click', function(e) {
               
                if(selectedLayerID){
    
                    routesLayer.eachLayer(function(layer) {
                  
                        if(layer.layerID === selectedLayerID){
                            layer.setStyle(routeDeSelectedStyle);
                        }
                        
                    })
    
                }
    
                setSelectedLayerID(null)

                updateSelectedLayerID(null)
            })

        }

    }

    render() {
        const { center, zoom} = this.state;
        const position = [center.lat, center.long]
        
        return (
           
                <Map center={position} zoom={zoom} ref={ m => {this.mapRef = m}}>
                    {/* <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    /> */}
                </Map>
            
        )

    }
}

export default MapComponent;