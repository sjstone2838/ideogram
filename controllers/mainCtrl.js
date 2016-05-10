(function() {  
  function MainCtrl ($http, ENV) {
    var vm = this;
    var arms = [];
    var bands = [];
    var url = ENV.url+'?access_token='+ENV.accessToken;
    vm.chromosomes = _.range(1,23);
    vm.chromosomes.push('X','Y');
    vm.loading = false;

    // Keep track of viewed chromosomes to avoid extra API calls
    var viewedChromosomes = [];

    vm.updateChromosome = function (selectedChromosome){
      if (viewedChromosomes.indexOf(selectedChromosome) == -1) {
        vm.loading = true;
        viewedChromosomes.push(selectedChromosome);
        var data = {
         'fields': [
          "arm",
          "band_label",
          "genomic_coordinates.start",
          "genomic_coordinates.stop",
          "genomic_coordinates.chromosome",
          "density",
         ],
         'filters': [{and: [
          ["band_level", "550"],
          ["genomic_coordinates.chromosome", selectedChromosome],
         ]}]
        };
        $http.post(url,data).then(function(response) {
          var selectedBands = response.data.results;
          selectedBands.forEach(function(band){
            bands.push(band);
          });

          selectedBands.forEach(function(band){
            var arm = arms.filter(function(x){
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
              arms.push(arm);
            } else {
              if (band.genomic_coordinates.stop > arm.stop){
                arm.stop = band.genomic_coordinates.stop
              } 
              if (band.genomic_coordinates.start < arm.start){
                arm.start = band.genomic_coordinates.start
              }
            }
          });
          vm.loading = false;
          renderIdeogram(selectedChromosome);
        });
      } else {
        renderIdeogram(selectedChromosome);
      }
    }
    
    function renderIdeogram(selectedChromosome){
      var p_arm = arms.filter(function(arm){
        return arm.chromosome == selectedChromosome && arm.arm == 'p';
      })[0];
      var q_arm = arms.filter(function(arm){
        return arm.chromosome == selectedChromosome && arm.arm == 'q';
      })[0];
      
      vm.selectedBands = bands.filter(function(band){
        return band.genomic_coordinates.chromosome == selectedChromosome;
      });

      d3.selectAll('g').remove();

      var xScale = d3.scale.linear()
        .domain([0,q_arm.stop])
        .range([0,fullWidth - widthOffset]);

      var densityScale = d3.scale.linear()
        .domain([0,100])
        .range([0.0,1.0]);
      
       // p arm
      d3.selectAll(".p_arm")
        .attr('width',xScale(p_arm.stop))

      // q arm
      d3.selectAll(".q_arm")
        .attr('x', xScale(q_arm.start))
        .attr('width',xScale(q_arm.stop - q_arm.start))

      // band container
      d3.selectAll('svg')
        .selectAll('g')
        .data(vm.selectedBands)
        .enter()
        .append('g')
        .attr("transform", function (band){ 
          return "translate(" + xScale(band.genomic_coordinates.start) + ",0)";})
        
      // band
      d3.selectAll('g')
        .append('rect')
        .attr('fill-opacity',0)
        .attr('width', function(band){
          return xScale(band.genomic_coordinates.stop - band.genomic_coordinates.start);
        })
        .on("mouseover", function() { 
          d3.select(this).classed('active', true);
          d3.select(this.parentNode).selectAll('text').classed('active', true);
        })
        .on("mouseout", function() { 
          d3.select(this).classed('active', false);
          d3.select(this.parentNode).selectAll('text').classed('active', false);
        })
        .attr('fill-opacity',function(band){
          return densityScale(band.density);
        })
        .attr('class','band')

      // band label
      d3.selectAll('g').append('text').attr('y',"4em").text(function(band){ 
        return "Band: "+ band.band_label 
      });
      d3.selectAll('g').append('text').attr('y',"5em").text(function(band){ 
        return "Start Coordinate: "+ band.genomic_coordinates.start 
      });
      d3.selectAll('g').append('text').attr('y',"6em").text(function(band){ 
        return "Stop Coordinate: "+ band.genomic_coordinates.stop 
      });
      d3.selectAll('g').append('text').attr('y',"7em").text(function(band){ 
        return "Density (BPHS): "+ band.density 
      });

      // format arms and bands
      d3.selectAll('rect')
        .attr('y',0)
        .attr('height',height)
      d3.selectAll(".arm")
        .attr('rx',radius);

      // telomere and centromere "caps"
      d3.selectAll('svg').append('path')
       .attr('d',"M "+radius+",0 A"+radius+","+radius+" 0 0,0 "+radius+","+height+" L0 "+height+" L0 0 Z");

      d3.selectAll('svg').append('path')
        .attr('d', "M"+(xScale(p_arm.stop)-radius)+",0 A"+radius+","+radius+" 0 0,1 "+(xScale(p_arm.stop)-radius)+","+height+" L"+(xScale(p_arm.stop)+radius)+","+height+" A"+radius+","+radius+" 0 0,1 "+(xScale(p_arm.stop)+radius)+",0 L"+(xScale(p_arm.stop)-radius)+" 0 Z");

      d3.selectAll('svg').append('path')
        .attr('d', "M"+(width-radius)+",0 A"+radius+","+radius+" 0 0,1 "+(width-radius)+","+height+" L"+width+" "+height+" L"+width+" 0 Z");
    }
  }

  angular.module('app').controller('MainCtrl',['$http', 'ENV', MainCtrl]); 
})();



