import React, { Component, Fragment} from "react";
import  Button  from '@material-ui/core/Button';
import L from "leaflet";
import * as LG from 'esri-leaflet-geocoder';
import Slider from '@material-ui/core/Slider';
import APIcalls from '../utils/APIcalls';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


var esri = require('esri-leaflet');

class ODPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            origin:null,
            destination: null,
            timePrefer:5,
            energyPrefer:5,
            crimePrefer:5,
            EVType:[],
            carModelValue:37, // tesla model s long range
            carModelName:"Tesla Model S Long Range",
            OMarker:null,
            DMarker:null
        }
       

    }

    updateO = (origin,latlng) => {
        this.setState({ origin:{"lat": latlng.lat, "lon": latlng.lng}})
    }

    updateD = (destination,latlng) => {
        this.setState({ destination:{"lat": latlng.lat, "lon": latlng.lng}})
    }

    componentDidMount() {

        APIcalls.callPostgeSQL().then(([response, jsonBody]) => {
            if (response.status === 200) {
            // console.log(jsonBody)
              this.setState({ EVType:jsonBody})
            }else{
              alert('no EVType returned.')
            }
          })


        
  
    }

    initialMarker = () => {
        const { mapRef} = this.props;
        const map = mapRef.leafletElement;
        this.setState({ OMarker:L.layerGroup().addTo(map)})
        this.setState({ DMarker:L.layerGroup().addTo(map)})
        
    }

    componentDidUpdate(prevProps, prevState) {
        const { mapRef, originDemo, destinationDemo} = this.props;
        const { origin,  destination} = this.state;
        const updateO = this.updateO;
        const updateD = this.updateD;

        var redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });


        if (prevProps.mapRef === null) {
            const map = mapRef.leafletElement;

            const originControl = new LG.Geosearch({'expanded':true,'collapseAfterResult':false, 'placeholder':'Search for origin addresses for EV'}).addTo(map);
            const destinationControl = new LG.Geosearch({'expanded':true, 'collapseAfterResult':false, 'placeholder':'Search for destination addresses for EV'}).addTo(map);
            
            // lower the suggestion panel to avoid overlap
            originControl._suggestions.style.top = '60px'
            originControl._container.style.left = '30px'
            originControl._container.style.top = '350px'
            destinationControl._container.style.top = '350px'
            destinationControl._container.style.left = '30px'

            const initialMarker = this.initialMarker

            Promise.all([initialMarker()])
            .then(([result1]) => { 
                const {  OMarker, DMarker} = this.state;

                originControl.on('results', function (data) {
            
                    // set the suggested address to the input box
                    originControl._input.value = data.text

                    new LG.geocode()
                    .text(data.text)
                    .run(function (error, response) {
                    
                        OMarker.clearLayers();
                        OMarker.addLayer(L.marker(response.results[0].latlng));
                        //zoom to marker
                        map.fitBounds(L.latLngBounds([response.results[0].latlng]));
                        updateO(origin,response.results[0].latlng)

                        // for (var i = response.results.length - 1; i >= 0; i--) {
                        //     OMarker.addLayer(L.marker(response.results[i].latlng));
                        //     updateOD(origin,response.results[i].latlng)
                        // }
                    });
                    
                });


                destinationControl.on('results', function (data) {

                    // set the suggested address to the input box
                    destinationControl._input.value = data.text

                    new LG.geocode()
                    .text(data.text)
                    .run(function (error, response) {
                        console.log(response.results[0].latlng)
                        DMarker.clearLayers();
                        DMarker.addLayer(L.marker(response.results[0].latlng,{icon: redIcon}));
                        //zoom to marker
                        map.fitBounds(L.latLngBounds([response.results[0].latlng]));
                        updateD(destination,response.results[0].latlng)

                    });

                    // for (var i = data.results.length - 1; i >= 0; i--) {
                    //     DMarker.addLayer(L.marker(data.results[i].latlng));
                    //     updateOD(destination,data.results[i].latlng)
                    // }
                });
            })

        }



        if (prevProps.destinationDemo !== destinationDemo && destinationDemo !== null) {
            const {  OMarker, DMarker} = this.state;
            OMarker.clearLayers();
            OMarker.addLayer(L.marker({"lat": originDemo.lat, "lng": originDemo.lon}));
            DMarker.clearLayers();
            DMarker.addLayer(L.marker({"lat": destinationDemo.lat, "lng": destinationDemo.lon},{icon: redIcon}));
            //updateO(origin,{"lat": originDemo.lat, "lng": originDemo.lon})
        }


    }


    submitOD = () => {
        console.log('submit OD')

        const { updateOD, updatecalRoutes,updateODsubmittedStatus} = this.props;
        const { origin, destination,timePrefer,energyPrefer,crimePrefer,carModelName} = this.state;

        updateOD(origin,destination)
        updatecalRoutes(origin,destination,timePrefer,energyPrefer,crimePrefer,carModelName)
        updateODsubmittedStatus(1)
    }

    resetLayers = () => {
        const { mapRef} = this.props;
        const map = mapRef.leafletElement;
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });

        var layer = esri.basemapLayer('Gray');

        map.addLayer(layer);

        var layerLabels = esri.basemapLayer('Gray' + 'Labels');
        map.addLayer(layerLabels);
    }

    findDemo = (demoID) => {
        console.log('retrieve demo')
        const { updatecalRoutesFromDemo} = this.props;

        updatecalRoutesFromDemo(demoID)
    }

    changeTimePrefer = (e,val) => {

        this.setState({ timePrefer:val})
  
    }
  
    changeEnergyPrefer = (e,val) => {
  
      this.setState({ energyPrefer:val})
  
    }
  
    changeCrimePrefer = (e,val) => {
  
      this.setState({ crimePrefer:val})
  
    }

    setCarName = (carmodelName) => {
        this.setState({ carModelName:carmodelName })
    }

    changeCarModel = (e) => {
        console.log(e.target.value)
        this.setState({ carModelValue:e.target.value})

        const { EVType } = this.state;

        var setCarName = this.setCarName

        EVType.forEach(function(ele){
            if (ele.id === e.target.value){
                setCarName(ele.evtype)
            }
        })

    }

    render() {
        const { loading} = this.props;

        return (
            <Fragment>
            <div id='ODPanel'>
                <Button variant="contained" color="secondary" onClick = {this.submitOD} disabled={loading}>Plan the Route </Button>
                
                <Button style={{left:'15px'}} variant="contained" color="primary" onClick = {() => this.findDemo(1)}>Demo 1</Button>
                <Button style={{left:'25px'}} variant="contained" color="primary" onClick = {() => this.findDemo(2)}>Demo 2</Button>
            </div>
            <div id ='preferSildes'>
                <p style={{marginTop:'5px',color:'#3f51b5',fontSize:'15px'}}>
                    Crime
                </p>
                <Slider
                    defaultValue={5}
                    onChange = {this.changeCrimePrefer}
                    aria-labelledby="discrete-slider-always"
                    step={1}
                    marks={true}
                    valueLabelDisplay="on"
                    max={10}
                    min={1}
                />
                <p style={{marginTop:'5px',color:'#3f51b5',fontSize:'15px'}}>
                    Energy
                </p>
                <Slider
                    defaultValue={5}
                    onChange = {this.changeEnergyPrefer}
                    aria-labelledby="discrete-slider-always"
                    step={1}
                    marks={true}
                    valueLabelDisplay="on"
                    max={10}
                    min={1}
                />
                <p style={{marginTop:'5px',color:'#3f51b5',fontSize:'15px'}}>
                    Time
                </p>
                <Slider
                    defaultValue={5}
                    onChange = {this.changeTimePrefer}
                    aria-labelledby="discrete-slider-always"
                    step={1}
                    marks={true}
                    valueLabelDisplay="on"
                    max={10}
                    min={1}
                />
                <p style={{marginTop:'5px',color:'black',fontSize:'15px'}}>
                    Car Model
                </p>
                <div>
                <Select value={this.state.carModelValue} onChange={this.changeCarModel} style={{width:'100%'}}>
                    {this.state.EVType.map(evtype =>
                    <MenuItem id ={evtype.id} key={evtype.id} value={evtype.id}>{evtype.evtype}</MenuItem>
                    )}
                </Select>
                </div>
            </div>
            <div id='markerIcon'>
                <img src='https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' alt="Origin" width="17"/>
                <img src='https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' alt="Destination" width="17"/>
            </div>
            </Fragment>
          );
    }

}

export default ODPanel;