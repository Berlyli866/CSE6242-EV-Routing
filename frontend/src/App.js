import React, { Component, Fragment } from "react";
// import logo from './logo.svg';
import './App.css';
import APIcalls from './utils/APIcalls';
import ODPanel from './components/ODPanel';
import MapComponent from './components/MapComponent';
import SummaryPanel from './components/SummaryPanel';

class App extends Component {
  state = { 
    calRoutes: null,
    origin:null,
    destination:null,
    mapRef:null,
    layerIDDict:null,
    selectedLayerID:null,
    ODsubmitted:0,
    loading:false

  };
  
  componentDidMount() {

  };

  updatecalRoutes = (originR,destinationR,timePrefer,energyPrefer,crimePrefer,carModelName) => {
    console.log('cal route')
    // console.log(timePrefer)
    // console.log(energyPrefer)
    // console.log(crimePrefer)
    // console.log(carModelName)
    const lonLong = {"O": originR,"D": destinationR,"timePrefer":timePrefer,"energyPrefer":energyPrefer,"crimePrefer":crimePrefer,"carModel":carModelName}
    console.log(lonLong)
    this.setState({ loading:true})
    APIcalls.callFlaskBackend(lonLong).then(([response, jsonBody]) => {
      if (response.status === 200) {
        this.setState({ loading:false})
        this.setState({ calRoutes:jsonBody})
      }else{
        
        alert('no route calculated.')
      }
    })
    .catch((error) => {
      this.setState({ loading:false})
      alert('no route calculated.')
      // code to run if there are any problems
     })
  }

  updatecalRoutesFromDemo = (demoID) => {
    console.log('find demo route')
    const updateOD = this.updateOD;
    // console.log(timePrefer)
    // console.log(energyPrefer)
    // console.log(crimePrefer)
    // console.log(carModelName)
    var lonLong;
    if (demoID === 1){
       lonLong =  {"demo1":1,"demo2":0}
    }else{
       lonLong =  {"demo1":0,"demo2":1}
    }

    console.log(lonLong)
    APIcalls.callFlaskBackend(lonLong).then(([response, jsonBody]) => {
      if (response.status === 200) {
        console.log(jsonBody)
        updateOD({"lat": jsonBody["O"].lat, "lon": jsonBody["O"].lon},{"lat": jsonBody["D"].lat, "lon": jsonBody["D"].lon})
        delete jsonBody["O"];
        delete jsonBody["D"];
        delete jsonBody["timePrefer"];
        delete jsonBody["energyPrefer"];
        delete jsonBody["crimePrefer"];
        delete jsonBody["carModel"];
        this.setState({ calRoutes:jsonBody})
      }else{
        alert('no demo found.')
      }
    })
  }

  updateOD = (originR,destinationR) => {
    this.setState({ origin:originR})
    this.setState({ destination:destinationR})
  }

  getRefFromChild = (childRef) => {

      this.setState({
        mapRef: childRef
      });
  }

  updateLayerIDDict= (layerIDDict) => {
    this.setState({ layerIDDict:layerIDDict})
  }

  updateSelectedLayerID= (selectedLayerID) => {
    this.setState({ selectedLayerID:selectedLayerID})
  }  

  updateODsubmittedStatus= (ODsubmitted) => {
    this.setState({ ODsubmitted:ODsubmitted})
  }
  
  

  
  render() {
    const {
      calRoutes,
      origin,
      destination,
      mapRef,
      layerIDDict,
      selectedLayerID,
      ODsubmitted,
      loading
    } = this.state

    //console.log(data)

    return (
      <Fragment>
        {/* display OD as marker and route as line on the map */}
        <MapComponent
          origin = {origin}
          destination = {destination}
          calRoutes = {calRoutes}
          passRefUpward={this.getRefFromChild}
          updateLayerIDDict = {this.updateLayerIDDict}
          updateSelectedLayerID = {this.updateSelectedLayerID}
          
        />
        {/* OD inputbox is the starting point of the whole process */}
        <ODPanel
          originDemo = {origin}
          destinationDemo = {destination}
          updateOD = {this.updateOD}
          updatecalRoutes = {this.updatecalRoutes}
          mapRef = {mapRef}
          updateODsubmittedStatus = {this.updateODsubmittedStatus}
          updatecalRoutesFromDemo = {this.updatecalRoutesFromDemo}
          loading = {loading}
        />
        {/* evaluate the route by barchart */}
        <SummaryPanel 
          calRoutes = {calRoutes}
          selectedLayerID= {selectedLayerID}
          layerIDDict = {layerIDDict}
          ODsubmitted = {ODsubmitted}
        />
        {loading?<div className="loader"></div>:<div>1</div>}
      </Fragment>
    );
  }
}

export default App;
