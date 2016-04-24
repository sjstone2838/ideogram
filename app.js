'use strict';

var ideogram = angular.module('ideogram',[]);

function MainCtrl ($scope,$http) {
  // length from https://genome.ucsc.edu/goldenpath/help/hg19.chrom.sizes
  // centromere position from https://en.wikipedia.org/wiki/Centromere
  $scope.genes = [
    {chromosome: 1 , centromere_pos:   125000000 , stop_pos:   249250621},
    {chromosome: 2 , centromere_pos:   93300000  , stop_pos:   243199373},
    {chromosome: 3 , centromere_pos:   91000000  , stop_pos:   198022430},
    {chromosome: 4 , centromere_pos:   50400000  , stop_pos:   191154276},
    {chromosome: 5 , centromere_pos:   48400000  , stop_pos:   180915260},
    {chromosome: 6 , centromere_pos:   61000000  , stop_pos:   171115067},
    {chromosome: 7 , centromere_pos:   59900000  , stop_pos:   159138663},
    {chromosome: 8 , centromere_pos:   45600000  , stop_pos:   146364022},
    {chromosome: 9 , centromere_pos:   49000000  , stop_pos:   141213431},
    {chromosome: 10  , centromere_pos:   40200000  , stop_pos:   135534747},
    {chromosome: 11  , centromere_pos:   53700000  , stop_pos:   135006516},
    {chromosome: 12  , centromere_pos:   35800000  , stop_pos:   133851895},
    {chromosome: 13  , centromere_pos:   17900000  , stop_pos:   115169878},
    {chromosome: 14  , centromere_pos:   17600000  , stop_pos:   107349540},
    {chromosome: 15  , centromere_pos:   19000000  , stop_pos:   102531392},
    {chromosome: 16  , centromere_pos:   36600000  , stop_pos:   90354753},
    {chromosome: 17  , centromere_pos:   24000000  , stop_pos:   81195210},
    {chromosome: 18  , centromere_pos:   17200000  , stop_pos:   78077248},
    {chromosome: 19  , centromere_pos:   26500000  , stop_pos:   63025520},
    {chromosome: 20  , centromere_pos:   27500000  , stop_pos:   59128983},
    {chromosome: 21  , centromere_pos:   13200000  , stop_pos:   48129895},
    {chromosome: 22  , centromere_pos:   14700000  , stop_pos:   51304566},
  ];
  var url = 'https://api.solvebio.com/v1/datasets/ISCN/1.1.0-2015-01-05/Ideograms/data?access_token=98e8f6ba570311e4bab59f6dc3060e21';
  var data = {
   'fields': [
    "arm",
    "band_label",
    "genomic_coordinates.start",
    "genomic_coordinates.stop",
    "density"
   ],
   'filters': [{and: [
    // ["genomic_coordinates.chromosome", "19"],
    ["band_level", "550"]
   ]}]
  };

  $scope.height = 20;
  $scope.width = 500;
  $scope.radius = $scope.height / 2;
  $scope.viewbox = "0 0 "+$scope.width+" "+$scope.height;

  $scope.geneData = $http.post(url, data).
    then(function(response) {
      $scope.geneData = response.data.results;
      $scope.geneData.forEach(function(gene){
        // extract and append chromosome id
        gene.chromosome = gene.band_label.split(/[a-z]/)[0];
        // add in relative start and stop 
        var chromosome = $scope.genes.filter(function(x){return x.chromosome == gene.chromosome})[0];
        gene.rel_start = gene.genomic_coordinates.start / chromosome.stop_pos * $scope.width;
        gene.rel_stop = gene.genomic_coordinates.stop / chromosome.stop_pos * $scope.width;
        gene.rel_density = (gene.density / 25 + 1) / 5;
      });
      $scope.selectedChromosomes = $scope.geneData;
  })
  
  $scope.updateChromosome = function (selectedChromosome){
    $scope.selectedChromosomes = $scope.geneData.filter(function(gene){
      return (gene.chromosome == selectedChromosome);
    });
    var gene = $scope.genes.filter(
      function(gene){return gene.chromosome == selectedChromosome;}
    )[0]
    var rel_centromere_pos = gene.centromere_pos / gene.stop_pos;
    $scope.rel_centromere_pos = rel_centromere_pos * $scope.width;
  };
}

angular
  .module('ideogram')
  .controller('MainCtrl', MainCtrl)
  .directive('ideogram', function(){
    return {
      templateUrl: 'templates/ideogram.html'
    };
  })
;

