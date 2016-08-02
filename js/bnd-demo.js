var map, drone;
(function(){
  'use strict';
var droneAdded = false;

(function(Popcorn) {
  Popcorn.plugin("slowmo", (function(){
    var oldRate;
    return {
      manifest: {
        about: {
          name: "Popcorn SlowMo Plugin",
          version: "0.1",
          author: "Stefan Wehrmeyer",
          website: "http://stefanwehrmeyer.com/"
        },
        options: {
          start: {
            elem: "input",
            type: "text",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "text",
            label: "End"
          },
          rate: {
            elem: "input",
            type: "float",
            label: "Playback Rate"
          }
        }
      },
      start: function(event, options){
        oldRate = this.playbackRate();
        this.playbackRate(options.rate);
      },
      end: function(event, options){
        this.playbackRate(oldRate);
      }
    };
  })());

  Popcorn.plugin("draw", (function(){
    var canvas = document.getElementById('video-canvas');
    var context = canvas.getContext('2d');
    return {
      manifest: {
        about: {
          name: "Popcorn Draw Plugin",
          version: "0.1",
          author: "Stefan Wehrmeyer",
          website: "http://stefanwehrmeyer.com/"
        },
        options: {
          start: {
            elem: "input",
            type: "text",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "text",
            label: "End"
          }
        }
      },
      start: function(event, options){
        options.draw(context);
      },
      end: function(event, options){
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  })());

  var maps = {};

  Popcorn.plugin( "leafletmap", function ( options ) {
    return {
      start: function( event, options ) {
        options.map.setView([options.lat, options.lng], options.zoom, {animate: true});
      },
      end: function( event, options ) { }
    };
  }, {
    about: {
      name: "Mapbox Map Plugin",
      version: "0.1",
      author: "@stefanwehrmeyer",
      website: "stefanwehrmeyer.com"
    },
    options: {
      start: {
        elem: "input",
        type: "start",
        label: "Start"
      },
      end: {
        elem: "input",
        type: "start",
        label: "End"
      },
      target: "map-container",
      type: {
        elem: "input",
        type: "text",
        label: "Map ID",
        optional: true
      },
      zoom: {
        elem: "input",
        type: "text",
        label: "Zoom",
        "default": 0,
        optional: true
      },
      lat: {
        elem: "input",
        type: "text",
        label: "Lat",
        optional: true
      },
      lng: {
        elem: "input",
        type: "text",
        label: "Lng",
        optional: true
      }
    }
  });

 Popcorn.plugin( "drone", function ( options ) {
    return {
      start: function( event, options ) {
        if (!droneAdded) {
          drone.addTo(map);
          droneAdded = true;
        }
        if (options.latlng){
          drone.setLatLng(options.latlng);
        }
        if (options.angle) {
          drone.setIconAngle(options.angle);
        }
      },
      end: function(event, options) {}
    };
  }, {
    about: {
      name: "Drone Move Plugin",
      version: "0.1",
      author: "@stefanwehrmeyer",
      website: "stefanwehrmeyer.com"
    },
    options: {
      start: {
        elem: "input",
        type: "start",
        label: "Start"
      },
      lat: {
        elem: "input",
        type: "text",
        label: "Lat",
        optional: true
      },
      lng: {
        elem: "input",
        type: "text",
        label: "Lng",
        optional: true
      },
      angle: {
        elem: "input",
        type: "text",
        label: "Angle",
        optional: true
      }
    }
  });

 Popcorn.plugin( "smoothscroll", function ( options ) {
    return {
      start: function( event, options ) {
        $.smoothScroll({
          scrollTarget: '#' + options.target,
          afterScroll: function() {
            window.location.href = '#' + options.target;
          }
        });
      },
      end: function(event, options) {}
    };
  }, {
    about: {
      name: "SmoothScroll Plugin",
      version: "0.1",
      author: "@stefanwehrmeyer",
      website: "stefanwehrmeyer.com"
    },
    options: {
      start: {
        elem: "input",
        type: "start",
        label: "Start"
      },
      target: {
        elem: "input",
        type: "text",
        label: "Anchor"
      }
    }
  });

})( Popcorn );


$(function(){

  var popcorn;

  var sections = {
    'bnd-hq': 0,
    'front-gate': 60,
    'spy-school': 82,
    'demo': 143,
    'closing': 215
  };

  $('#map').height($(window).height() - $('#video').height() - $('#info').height() - 20);
  // $('body').scrollspy({
  //   target: $('#navbar')[0],
  //   offset: 20
  // });
  var videoToAnchor = function(){
    var section = $('#navbar li.active a').attr('href');
    if (!section) {
      return;
    }
    section = section.substring(1);
    var wasPaused = popcorn.paused();
    popcorn.play(sections[section]);
    if (wasPaused){
      // popcorn.pause();
    }
  };
  $('#navbar').on('activate', function(){
    videoToAnchor();
  });

  // $('#video').click(function(e){
  //   console.log(e);
  //   if (popcorn.paused()){
  //     popcorn.play();
  //   } else {
  //     popcorn.pause();
  //   }
  // });

  var refresh = function(){
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this).scrollspy('refresh').scrollspy('process');
      videoToAnchor();
    });
  };
  $(window).resize(refresh);
  $(window).load(refresh);

  map = L.map('map').setView(
    [52.533793,13.376316], 15);

  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>, CartoDB <a href="https://cartodb.com/attributions">attribution</a',
      maxZoom: 18,
  }).addTo(map);

  drone = L.marker([52.533881,13.379159], {
    clickable: false,
    icon: L.icon({
      iconUrl: 'img/drone.png',
      iconRetinaUrl: 'img/drone@2x.png',
      iconSize: [28, 28],
      iconAnchor: [10, 10],
      popupAnchor: [0, 0]
      // shadowUrl: 'my-icon-shadow.png',
      // shadowRetinaUrl: 'my-icon-shadow@2x.png',
      // shadowSize: [68, 95],
      // shadowAnchor: [22, 94]
    })
  });

  popcorn = Popcorn("#video");

  popcorn
  // .smoothscroll({
  //   start: 1,
  //   target: 'bnd-hq'
  // })
  .drone({
    start: 2,
    latlng: [52.533881, 13.379159],
    angle: 270
  })
  .leafletmap({
    start: 2,
    lat: 52.533881,
    lng: 13.379159,
    zoom: 18,
    map: map
  })
  .code({
    start: 1,
    onStart: function( options ) {
      var aerial = L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2011_20", {
          layers: '0',
          styles: 'fill',
          format: 'image/jpeg',
          transparent: true,
          attribution: '<a href="http://senstadt.berlin.de">Luftbilder 2011, SenStadt Berlin</a>',
          crs: L.CRS.EPSG4326
      });
      aerial.setOpacity(0.3).addTo(map);
    },
    onEnd: function( options ) {}
  })
  .drone({
    start: 12,
    angle: 250
  })
  .drone({
    start: 14,
    angle: 270
  })
  .drone({
    start: 24,
    latlng: [52.533891,13.379003]
  })
  .drone({
    start: 31,
    latlng: [52.533861,13.378912]
  })
  .drone({
    start: 37,
    angle: 250
  })
  .slowmo({
    start: 44,
    end: 46,
    rate: 0.4
  })
  .draw({
    start: 44,
    end: 47,
    draw: function(ctx){
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.rect(570, 150, 60, 100);
      ctx.stroke();
      ctx.font = '18pt Helvetica';
      ctx.fillStyle = 'red';
      ctx.fillText('Also Belongs to the BND', 200, 20);
    }
  })
  // .code({
  //   start: 59,
  //   onStart: function(){
  //     popcorn.pause();
  //   }
  // })
  // .smoothscroll({
  //   start: 60,
  //   target: 'front-gate'
  // })
  // .code({
  //   start: 81,
  //   onStart: function(){
  //     popcorn.pause();
  //   }
  // })
  // .smoothscroll({
  //   start: 82,
  //   target: 'spy-school'
  // })
  .leafletmap({
    start: 82,
    lat: 52.533741,
    lng: 13.379293,
    zoom: 16,
    map: map
  })
  .drone({
    start: 82,
    latlng: [52.533741,13.379293],
    angle: 200
  })
  .leafletmap({
    start: 100,
    lat: 52.533465,
    lng: 13.379621,
    zoom: 16,
    map: map
  })
  .drone({
    start: 112,
    latlng: [52.533465,13.379621]
  })
  .drone({
    start: 135,
    latlng: [52.533414,13.37969],
    angle: 200
  })
  .leafletmap({
    start: 133,
    lat: 52.533414,
    lng: 13.37969,
    zoom: 17,
    map: map
  })
  .drone({
    start: 138,
    angle: 250
  })
  // .code({
  //   start: 142,
  //   onStart: function(){
  //     popcorn.pause();
  //   }
  // })
  // .smoothscroll({
  //   start: 143,
  //   target: 'demo'
  // })
  .drone({
    start: 143,
    latlng: [52.532382,13.378977],
    angle: 40
  })
  .leafletmap({
    start: 143,
    lat: 52.532382,
    lng: 13.378977,
    zoom: 18,
    map: map
  })

  .drone({
    start: 190,
    latlng: [52.531886,13.377818],
    angle: 120
  })
  .leafletmap({
    start: 190,
    lat: 52.531886,
    lng: 13.377818,
    zoom: 18,
    map: map
  })
  .leafletmap({
    start: 215,
    lat: 52.531677,
    lng: 13.376088,
    zoom: 16,
    map: map
  })
  .drone({
    start: 215,
    latlng: [52.531677,13.376088],
    angle: 120
  })
  .leafletmap({
    start: 216,
    lat: 52.531677,
    lng: 13.376088,
    zoom: 16,
    map: map
  })
  // .code({
  //   start: 214,
  //   onStart: function(){
  //     popcorn.pause();
  //   }
  // })
  // .smoothscroll({
  //   start: 215,
  //   target: 'closing'
  // })
  .leafletmap({
    start: 225,
    lat: 52.531677,
    lng: 13.376088,
    zoom: 18,
    map: map
  })
  .drone({
    start: 238,
    angle: 45
  })
  .drone({
    start: 243,
    angle: 25
  })

  ;
  var demoRoute = L.polyline(
    [{"lat":52.53616210082203,"lng":13.376551866531372},{"lat":52.53605768584837,"lng":13.376240730285645},{"lat":52.53500373330553,"lng":13.377533555030823},{"lat":52.53390407164182,"lng":13.37886929512024},{"lat":52.532840277773104,"lng":13.380210399627686},{"lat":52.53152192077867,"lng":13.376691341400146}],
    {color: 'white'}).addTo(map);

  var bndArea = L.polygon(
    [{"lat":52.534595850144775,"lng":13.373676538467407},{"lat":52.53469374244891,"lng":13.374019861221313},{"lat":52.53509183557069,"lng":13.373665809631348},{"lat":52.53596632254274,"lng":13.37609052658081},{"lat":52.53284680419442,"lng":13.380038738250732},{"lat":52.5321615246596,"lng":13.378005623817444},{"lat":52.53238016262526,"lng":13.377721309661865},{"lat":52.53233774041852,"lng":13.377555012702942},{"lat":52.53207994305028,"lng":13.377791047096252},{"lat":52.53202120419771,"lng":13.37760329246521},{"lat":52.5322202633245,"lng":13.37735116481781},{"lat":52.5318417238836,"lng":13.376326560974121},{"lat":52.53415206896213,"lng":13.374062776565552}],
    {color: 'grey'}).addTo(map);

  $('#intro').modal();

});

}());
