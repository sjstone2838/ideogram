(function() {
  function ideogram ($window,$timeout){
    return {
      restrict:'E',
      template:"<svg viewbox='0 0 "+fullWidth+" "+(height * 3)+"'></svg>",
      link: function(scope, elem, attrs){

        var d3 = $window.d3;
        var rawSvg = elem.find("svg")[0];
        var svg = d3.select(rawSvg);
        
        svg.append('rect')
          .attr('x',0)
          .classed('p_arm arm', true)

        svg.append('rect')
          .classed('q_arm arm', true)
      }
    };
  }

  angular.module('app').directive('ideogram', ['$window','$timeout', ideogram]);
})();