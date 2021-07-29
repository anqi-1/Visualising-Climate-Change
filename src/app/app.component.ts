import { Component } from '@angular/core';
import * as d3 from 'd3v4';
// load the json file from the assets folder, give it a name
import * as firstModel from '../assets/first20_med_a2.json';
import * as secondModel from '../assets/second20_med_a2.json';
import * as thirdModel from '../assets/third20_med_a2.json';
import * as fourthModel from '../assets/fourth20_med_a2.json';

import * as firstModel_b1 from '../assets/first20_med_b1.json';
import * as secondModel_b1 from '../assets/second20_med_b1.json';
import * as thirdModel_b1 from '../assets/third20_med_b1.json';
import * as fourthModel_b1 from '../assets/fourth20_med_b1.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  play = false;
  refresh = false;
  progress = false;


  // make sure to reference the correct structure
  firstModelData = firstModel['default'];
  secondModelData = secondModel['default'];
  thirdModelData = thirdModel['default'];
  fourthModelData = fourthModel['default'];
  firstModel_b1 = firstModel_b1['default']
  secondModel_b1 = secondModel_b1['default']
  thirdModel_b1 = thirdModel_b1['default']
  fourthModel_b1 = fourthModel_b1['default']
  
  jsons;
  jsons_a2 = [this.firstModelData, this.secondModelData, this.thirdModelData, this.fourthModelData];
  jsons_b1 = [this.firstModel_b1, this.secondModel_b1, this.thirdModel_b1, this.fourthModel_b1];

  dateRange = ['2020 - 2040', '2040 - 2060', '2060 - 2080', '2080 - 2100'];
  titleTag;
  divname;

  autoTicks = true;
  disabled = false;
  invert = false;
  max = 2100;
  min = 2040;
  showTicks = true;
  step = 20;
  thumbLabel = true;
  value = 2040;
  vertical = false;
  tickInterval = 20;

  sliderDate;
  drawCallout;

  scenarioAtwo = true;
  scenarioBone = false;

  canadaPick = false;

  svgWidth;
  xMargin;
  graphShift;

  scenario = 'Scenario A2';

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  ngOnInit() {
    let width = window.innerWidth;
    // print the json data in the browser console
    console.log(this.firstModelData)
    this.jsons = this.jsons_a2;

    let windowWidth = width;

    if (windowWidth <= 500) {
      this.svgWidth = 375;
      this.xMargin = 50;
      this.graphShift = 50;
    } else {
      this.svgWidth = 400;
      this.xMargin = 30;
      this.graphShift = 40;
    }
    
    if (width > 500) {
      width = 500;
    }

    this.setMap(1000, 600, this.jsons[0]);
  }

  scenarioA2(){
    this.scenarioAtwo = true;
    this.scenarioBone = false;
    this.jsons = this.jsons_a2;

    this.scenario = 'Scenario A2';

    d3.select('svg').remove();

    this.setMap(1000, 600, this.jsons[0])
  }

  scenarioB1(){
    this.scenarioAtwo = false;
    this.scenarioBone = true;
    this.jsons = this.jsons_b1;

    this.scenario = 'Scenario B1';

    d3.select('svg').remove();

    this.setMap(1000, 600, this.jsons[0])
  }

  pitch(event: any) {
    this.sliderDate = event.value;
    const sliderArray = ['2040', '2060', '2080', '2100'];
    this.thumbLabel = true;

    const i = sliderArray.indexOf(this.sliderDate.toString());

    this.transitionMap(this.jsons, i)
  }

  setMap(width, height, dataset) {

    d3.select('#stop').style('visibility', 'hidden');
    
    this.titleTag = this.dateRange[0];
    
    const margin = {top: 10, right: 30, bottom: 10, left: 30};
    
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const color_domain = [2.5, 4, 7, 9, 10];
    const color_legend = d3.scaleThreshold<string>().
    range(['#fee5d9', '#fcbba1', '#fc9272',  '#fb6a4a', '#de2d26', '#a50f15']).
    domain(color_domain);

    const projection = d3.geoMercator()
                      .rotate([-11, 0])
                      .scale(1)
                      .translate([0, 0]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.world-map')
                 .append('svg')
                 .attr('class', 'map')
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('viewBox', '0 0 1000 600')
                 .attr('preserveAspectRatio', 'xMidYMid')
                 .style('max-width', 1200)
                 .style('margin', 'auto')
                 .style('display', 'flex');

    const b = path.bounds(dataset),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0]  [1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    projection.scale(s).translate(t);

    svg.selectAll('path')
      .data(dataset.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('id', 'unselected')
      .style('fill', function(d) {
        const value = d['Temperature_change'];
          if (value) {  
            return color_legend(d['Temperature_change']);
          } else {
            return '#ccc';
          }
      })
      .style('stroke', '#fff')
      .style('stroke-width', '0.5')
      .classed('svg-content-responsive', true);

  }

  transitionMap(json, i) {
    const svg = d3.select('.world-map');

    this.titleTag = this.dateRange[i];

    const sliderArray = ['2040', '2060', '2080', '2100'];

    this.value = parseInt(sliderArray[i]);

    const color_domain = [2.5, 4, 7, 9, 10];
    
    const color_legend = d3.scaleThreshold<string>()
    .range(['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#de2d26', '#a50f15'])
    .domain(color_domain);

    console.log(json[i].features)


    svg.selectAll('path')
       .data(json[i].features)
       .transition()
       .delay(100)
       .duration(1000)
       .style('fill', function(d) {
        const value = d['Temperature_change'];
          if (value) {  
            return color_legend(d['Temperature_change']);
          } else {
            return '#ccc';
          }
      })
  }

  playButton() {

    this.play = true;
    this.progress = true;


    let time = 1;

    let interval = setInterval(() => { 
      if (time <= 3) { 
          this.transitionMap(this.jsons, time)
          time++;
      }
      else { 
          clearInterval(interval);
          this.progress = false;
          this.refresh = true;
      }
    }, 2000);

  }

  refreshButton() {
    let width = window.innerWidth;

    if (width > 1000) {
      width = 1000;
    }

    d3.select('svg').remove();
    this.setMap(1000, 600, this.jsons[0])

    this.play = false;
    this.refresh = false;
    this.value = 2040;
  }

  scrollDiv($element): void {
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }


}
