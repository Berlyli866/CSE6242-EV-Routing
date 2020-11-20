import React, { Component, Fragment } from "react";
import * as d3 from "d3";


class SummaryPanel extends Component {

    constructor(props) {
        super(props);
        this.selectedPath = 0;
        this.optimal = [];
        this.shortest = [];
        this.state = {

        }
    }

    componentDidMount() {

    }


    componentDidUpdate(prevProps, prevState) {
        const { calRoutes, selectedLayerID, layerIDDict, ODsubmitted } = this.props;

        if (prevProps.calRoutes !== calRoutes) {
            initalizeGraph(calRoutes);
        }

        if (prevProps.selectedLayerID !== selectedLayerID) {
            console.log(selectedLayerID);
            updateChart(selectedLayerID);

        }

        if (prevProps.layerIDDict !== layerIDDict) {
            console.log(layerIDDict)
        }

        if (prevProps.ODsubmitted !== ODsubmitted) {
            console.log(ODsubmitted)
        }

    }

    render() {
        return (
            <Fragment>

            </Fragment>
        );
    }

}

function clearChart() {
    return new Promise(resolve => {
        d3.selectAll("#graph").remove();
        console.log("Chart Cleared");
        resolve();
    });
}

async function updateChart(input) {
    await updateSeletedPath(input);
    await clearChart();
    if(input != null){
        await generateChart(input);
    }
}

function updateSeletedPath(input) {
    return new Promise(resolve => {
        SummaryPanel.selectedPath = input;
        resolve();
    });
}

function initalizeGraph(input){
    SummaryPanel.optimal = input.Optimal.geo.features;
    SummaryPanel.shortest = input.Shortest.geo.features;
}

function generateChart() {
    return new Promise(resolve => {
        console.log("Generating Chart");
        var roadCrime = [[], []];
        var roadEnergy = [[], []];
        var roadTime = [[], []];
        var ID = [[], []];
        var roadID = [{}, {}];
        var optimal = SummaryPanel.optimal;
        var shortest = SummaryPanel.shortest;

        for (var i = 0; i < optimal.length; i++) {
            roadCrime[0][i] = parseFloat(optimal[i].properties["Crime_count"]);
            roadEnergy[0][i] = parseFloat(optimal[i].properties["Energy"]);
            roadTime[0][i] = parseFloat(optimal[i].properties["Time(minutes)"]);
            roadID[0][optimal[i].properties["id"]] = i;
            ID[0][i] = i;
        }

        for (var i = 0; i < shortest.length; i++) {
            roadCrime[1][i] = parseFloat(shortest[i].properties["Crime_count"]);
            roadEnergy[1][i] = parseFloat(shortest[i].properties["Energy"]);
            roadTime[1][i] = parseFloat(shortest[i].properties["Time(minutes)"]);
            roadID[1][shortest[i].properties["id"]] = i;
            ID[1][i] = i;
        }
        var datasource = SummaryPanel.selectedPath === 1 ? shortest : optimal;
        var index = SummaryPanel.selectedPath === 1 ? 1 : 0;
        var dataText = SummaryPanel.selectedPath === 1 ? "Shortest" : "Optimal";

        var svg = d3.select("svg"),
            margin = 200,
            width = 600 - margin,
            height = 100

        var xScale = d3.scaleBand().range([0, 200]).padding(0.4),
            yScale = d3.scaleLinear().range([100, 0]);

        var g = svg.append("g")
            .attr("transform", "translate(" + window.innerWidth*0.8 + "," + 100 + ")")
            .attr('id', 'graph')
            .attr("class", "graph-svg-component");

        g.append("text")
            .attr("x", width / 3.5)
            .attr("y", -40)
            .style("text-anchor", "middle")
            .attr("stroke", "black")
            .text(dataText);

        xScale.domain(ID[index]);
        yScale.domain([0, Math.max(...roadCrime[index]) + Math.max(...roadCrime[index]) * 0.2]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height - 80)
            .attr("x", width - 160)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Road ID")

        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d;
            }).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Crime Rate");

        g.selectAll(".bar")
            .data(datasource)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xScale(roadID[index][d.properties["id"]]); })
            .attr("y", function (d) { return yScale(d.properties["Crime_count"]); })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) { return height - yScale(d.properties["Crime_count"]); });

        //Energy Graph
        var g2 = svg.append("g")
            .attr("transform", "translate(" + window.innerWidth*0.8 + "," + 300 + ")")
            .attr('id', 'graph')
            .attr("class", "graph-svg-component");

        yScale.domain([0, Math.max(...roadEnergy[index]) + Math.max(...roadEnergy[index]) * 0.2]);

        g2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height - 80)
            .attr("x", width - 160)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Road ID")

        g2.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d;
            }).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Energy");

        g2.selectAll(".bar")
            .data(datasource)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xScale(roadID[index][d.properties["id"]]); })
            .attr("y", function (d) { return yScale(d.properties["Energy"]); })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) { return height - yScale(d.properties["Energy"]); });

        //Time Graph
        var g3 = svg.append("g")
            .attr("transform", "translate(" + window.innerWidth*0.8 + "," + 500 + ")")
            .attr('id', 'graph')
            .attr("class", "graph-svg-component");

        yScale.domain([0, Math.max(...roadTime[index]) * 1.2]);

        g3.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", height - 80)
            .attr("x", width - 160)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Road ID")

        g3.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d;
            }).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Time");

        g3.selectAll(".bar")
            .data(datasource)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xScale(roadID[index][d.properties["id"]]); })
            .attr("y", function (d) { return yScale(d.properties["Time(minutes)"]); })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) { return height - yScale(d.properties["Time(minutes)"]); });

        var ticks = d3.selectAll(".tick text");
        ticks.each(function (_, i) {
            if (i % 2 !== 0) d3.select(this).remove();
        });
        resolve();
    });
}

export default SummaryPanel;