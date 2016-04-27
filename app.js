'use strict';

var ideogram = angular.module('ideogram',[]);

function MainCtrl ($scope,$http) {
  var url = 'https://api.solvebio.com/v1/datasets/ISCN/1.1.0-2015-01-05/Ideograms/data?access_token=98e8f6ba570311e4bab59f6dc3060e21&limit=10000';
  var data = {
   'fields': [
    "arm",
    "band_label",
    "genomic_coordinates.start",
    "genomic_coordinates.stop",
    "genomic_coordinates.chromosome",
    "density",
   ],
   'limit': "10000",
   'filters': [{and: [
    // ["genomic_coordinates.chromosome", "7"],
    ["band_level", "550"]
   ]}]
  };

  $scope.height = 20;
  $scope.width = 500;
  var widthOffset = 75;
  $scope.radius = $scope.height / 2;
  $scope.viewbox = "0 0 "+$scope.width+" "+$scope.height;
  $scope.arms = [];

  $http.post(url,data).
    then(function(response) {
      $scope.bands = response.data.results;

      $scope.bands.forEach(function(band){
        var arm = $scope.arms.filter(function(x){
          return x.chromosome == band.genomic_coordinates.chromosome &&
           x.arm == band.arm
        })[0];
        
        if (!arm){
          var arm = {
            chromosome: band.genomic_coordinates.chromosome,
            arm: band.arm,
            start: band.genomic_coordinates.start,
            stop: band.genomic_coordinates.stop,
          };
          $scope.arms.push(arm);
        } else {
          if (band.genomic_coordinates.stop > arm.stop){
            arm.stop = band.genomic_coordinates.stop
          } 
          if (band.genomic_coordinates.start < arm.start){
            arm.start = band.genomic_coordinates.start
          }
        }
      });
      $scope.chromosomes = _.range(1,23);
      $scope.chromosomes.push('X','Y');

  })
  
  $scope.updateChromosome = function (selectedChromosome){
    var p_arm = $scope.arms.filter(function(arm){
      return arm.chromosome == selectedChromosome && arm.arm == 'p';
    })[0];
    var q_arm = $scope.arms.filter(function(arm){
      return arm.chromosome == selectedChromosome && arm.arm == 'q';
    })[0];
    var bands = $scope.bands.filter(function(band){
      return band.genomic_coordinates.chromosome == selectedChromosome;
    });

    d3.selectAll('rect').remove();
    d3.selectAll('g').remove();

    var xScale = d3.scale.linear()
      .domain([0,q_arm.stop])
      .range([0,$scope.width - widthOffset]);

    var densityScale = d3.scale.linear()
      .domain([0,100])
      .range([0.0,1.0]);
    
    // // p arm
    // var p_arm_svg = d3.select("#ideogram")
    //   .selectAll('rect')
    //   .data('p_arm');

    // //p_arm_svg.exit().remove();

    // p_arm_svg.enter()
    //   .append('rect')
    //   .attr('x',0)
    //   .attr('width',xScale(p_arm.stop))
    //   .attr('class','arm');

     // p arm
    d3.select("#ideogram")
      .append('rect')
      .attr('x', 0)
      .attr('width',xScale(p_arm.stop))
      .attr('class','arm');

    // q arm
    d3.select("#ideogram")
      .append('rect')
      .attr('x', xScale(q_arm.start))
      .attr('width',xScale(q_arm.stop - q_arm.start))
      .attr('class','arm');

    // band container
    d3.select('#ideogram')
      .selectAll('g')
      .data(bands)
      .enter()
      .append('g')
      .attr("transform", function (band){ 
        return "translate(" + xScale(band.genomic_coordinates.start) + ",0)";})
      
    // band
    d3.selectAll('g')
      .append('rect')
      .attr('width',0)
      .attr('width', function(band){
        return xScale(band.genomic_coordinates.stop - band.genomic_coordinates.start);
      })
      .attr('fill-opacity',function(band){
        return densityScale(band.density);
      })
      .attr('class','band')
      .on("mouseover", function() { 
        d3.select(this).classed('active', true);
        d3.select(this.parentNode).selectAll('text').classed('active', true);
      })
      .on("mouseout", function() { 
        d3.select(this).classed('active', false);
        d3.select(this.parentNode).selectAll('text').classed('active', false);
      });

    // band label
    d3.selectAll('g').append('text').attr('y',"4em").text(function(band){ return "Band: "+ band.band_label });
    d3.selectAll('g').append('text').attr('y',"5em").text(function(band){ return "Start: "+ band.genomic_coordinates.start });
    d3.selectAll('g').append('text').attr('y',"6em").text(function(band){ return "Start: "+ band.genomic_coordinates.stop });
    d3.selectAll('g').append('text').attr('y',"7em").text(function(band){ return "Density: "+ band.density });

    // format all arms and bands
    d3.selectAll('rect')
      .attr('y',0)
      .attr('height',$scope.height)
    d3.selectAll(".arm")
      .attr('rx',$scope.height / 2);

    // telomere and centromere cover stubs
    var radius = $scope.radius;
    var height = $scope.height;
    var width = $scope.width-widthOffset;
    
    d3.select('#ideogram').append('path')
     .attr('d',"M "+radius+",0 A"+radius+","+radius+" 0 0,0 "+radius+","+height+" L0 "+height+" L0 0 Z");

   d3.select('#ideogram').append('path')
    .attr('d', "M"+(xScale(p_arm.stop)-radius)+",0 A"+radius+","+radius+" 0 0,1 "+(xScale(p_arm.stop)-radius)+","+height+" L"+(xScale(p_arm.stop)+radius)+","+height+" A"+radius+","+radius+" 0 0,1 "+(xScale(p_arm.stop)+radius)+",0 L"+(xScale(p_arm.stop)-radius)+" 0 Z");

   d3.select('#ideogram').append('path')
    .attr('d', "M"+(width-radius)+",0 A"+radius+","+radius+" 0 0,1 "+(width-radius)+","+height+" L"+width+" "+height+" L"+width+" 0 Z");
  }

}

angular
  .module('ideogram')
  .controller('MainCtrl', MainCtrl)
  // .directive('ideogram', function(){
  //   return {
  //     templateUrl: 'templates/ideogram.html'
  //   };
  // })
;

