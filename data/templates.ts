import { DiagramData } from '../types';

export const TEMPLATES: { id: string; name: string; description: string; data: DiagramData }[] = [
    {
        id: 'simple-network',
        name: 'Simple Architecture',
        description: 'A basic client-server setup with a database.',
        data: {
  "nodes": [
    {
      "id": "n1",
      "type": "rect",
      "label": "Client",
      "x": -200,
      "y": 350,
      "width": 108.4426249354338,
      "height": 554.9878333225722,
      "color": "#0d9488",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n4",
      "type": "rect",
      "label": "Database",
      "x": 970,
      "y": 790,
      "width": 100,
      "height": 100,
      "color": "#5218bf",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505075559",
      "type": "rect",
      "label": "Identity Provider",
      "x": 120,
      "y": 170,
      "width": 120,
      "height": 80,
      "color": "#60634b",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505077074",
      "type": "rect",
      "label": "CDN",
      "x": 130,
      "y": 490,
      "width": 120,
      "height": 80,
      "color": "#294770",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505108657",
      "type": "rect",
      "label": "API Gateway",
      "x": 450,
      "y": 330,
      "width": 127.82939876416049,
      "height": 442.69820025813374,
      "color": "#860d96",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505124617",
      "type": "rect",
      "label": "Static Content",
      "x": 450,
      "y": 650,
      "width": 120,
      "height": 80,
      "color": "#294770",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505152752",
      "type": "rect",
      "label": "",
      "x": 930,
      "y": 360,
      "width": 258.53378422004107,
      "height": 571.6765600787705,
      "color": "rgba(88, 150, 13, 0)",
      "borderColor": "#9cad14",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505193318",
      "type": "rect",
      "label": "Service",
      "x": 930,
      "y": 190,
      "width": 120,
      "height": 80,
      "color": "#be185d",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505204749",
      "type": "rect",
      "label": "Service",
      "x": 930,
      "y": 310,
      "width": 120,
      "height": 80,
      "color": "#0d9488",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505206229",
      "type": "rect",
      "label": "Service",
      "x": 930,
      "y": 430,
      "width": 120,
      "height": 80,
      "color": "#0d6896",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505207803",
      "type": "rect",
      "label": "Service",
      "x": 930,
      "y": 550,
      "width": 120,
      "height": 80,
      "color": "#4b5563",
      "borderColor": "#ffffff",
      "borderWidth": 2,
      "labelColor": "#ffffff",
      "fontSize": 14
    },
    {
      "id": "n-1764505315450",
      "type": "text",
      "label": "Backend",
      "x": 920,
      "y": 100,
      "width": 100,
      "height": 30,
      "color": "rgba(0, 0, 0, 0)",
      "borderColor": "rgba(0,0,0,0)",
      "borderWidth": 2,
      "labelColor": "#9cad14",
      "fontSize": 14
    }
  ],
  "links": [
    {
      "id": "l-1764505476414",
      "sourceId": "n1",
      "targetId": "n-1764505075559",
      "color": "#0d9488",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.03
    },
    {
      "id": "l-1764505478726",
      "sourceId": "n-1764505075559",
      "targetId": "n-1764505108657",
      "color": "#60634b",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505556177",
      "sourceId": "n-1764505108657",
      "targetId": "n-1764505193318",
      "color": "#860d96",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505557776",
      "sourceId": "n-1764505108657",
      "targetId": "n-1764505204749",
      "color": "#860d96",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505559069",
      "sourceId": "n-1764505108657",
      "targetId": "n-1764505206229",
      "color": "#860d96",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505560485",
      "sourceId": "n-1764505108657",
      "targetId": "n-1764505207803",
      "color": "#860d96",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505825824",
      "sourceId": "n-1764505124617",
      "targetId": "n-1764505077074",
      "color": "#294770",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505827728",
      "sourceId": "n-1764505077074",
      "targetId": "n1",
      "color": "#294770",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    },
    {
      "id": "l-1764505870388",
      "sourceId": "n4",
      "targetId": "n-1764505152752",
      "color": "#5218bf",
      "width": 3,
      "trafficSpeed": 1,
      "trafficDensity": 0.02
    }
  ],
  "globalSettings": {
    "cornerRadius": 0,
    "globalSpeed": 1
  }
}
    },
    {
        id: 'microservices',
        name: 'Microservices',
        description: 'A complex web of interconnected services and queues.',
        data: {
          "nodes": [
            {
              "id": "n1",
              "type": "rect",
              "label": "Service Mesh (Istio)",
              "x": 1030,
              "y": 980,
              "width": 160,
              "height": 100,
              "color": "#a78bfa",
              "borderColor": "#4ade80",
              "borderWidth": 3,
              "labelColor": "#ffffff",
              "fontSize": 14
            },
            {
              "id": "n2",
              "type": "rect",
              "label": "API Gateway",
              "x": 1000,
              "y": 560,
              "width": 140,
              "height": 90,
              "color": "#22d3ee",
              "borderColor": "#a78bfa",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n3",
              "type": "rect",
              "label": "Auth Service",
              "x": 1150,
              "y": 730,
              "width": 140,
              "height": 90,
              "color": "#f472b6",
              "borderColor": "#a78bfa",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 14
            },
            {
              "id": "n4",
              "type": "rect",
              "label": "User Service",
              "x": 600,
              "y": 820,
              "width": 140,
              "height": 90,
              "color": "#4ade80",
              "borderColor": "#22d3ee",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n5",
              "type": "rect",
              "label": "Orders Service",
              "x": 850,
              "y": 810,
              "width": 140,
              "height": 90,
              "color": "#facc15",
              "borderColor": "#f472b6",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n6",
              "type": "rect",
              "label": "Inventory Service",
              "x": 1500,
              "y": 810,
              "width": 140,
              "height": 90,
              "color": "#22d3ee",
              "borderColor": "#facc15",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n7",
              "type": "rect",
              "label": "Payment Service",
              "x": 1300,
              "y": 1130,
              "width": 140,
              "height": 90,
              "color": "#f472b6",
              "borderColor": "#22d3ee",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 14
            },
            {
              "id": "n8",
              "type": "rect",
              "label": "Notification Service",
              "x": 750,
              "y": 1270,
              "width": 140,
              "height": 90,
              "color": "#a78bfa",
              "borderColor": "#f472b6",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 14
            },
            {
              "id": "n9",
              "type": "circle",
              "label": "Postgres (Primary)",
              "x": 550,
              "y": 1200,
              "width": 120,
              "height": 120,
              "color": "#4ade80",
              "borderColor": "#22d3ee",
              "borderWidth": 3,
              "labelColor": "#000000",
              "fontSize": 13
            },
            {
              "id": "n10",
              "type": "circle",
              "label": "Redis Cache",
              "x": 1120,
              "y": 1430,
              "width": 120,
              "height": 120,
              "color": "#facc15",
              "borderColor": "#f472b6",
              "borderWidth": 3,
              "labelColor": "#000000",
              "fontSize": 13
            },
            {
              "id": "n12",
              "type": "circle",
              "label": "Kafka (Message Broker)",
              "x": 1440,
              "y": 990,
              "width": 140,
              "height": 140,
              "color": "#a78bfa",
              "borderColor": "#4ade80",
              "borderWidth": 3,
              "labelColor": "#ffffff",
              "fontSize": 13
            },
            {
              "id": "n13",
              "type": "rect",
              "label": "External Payment Gateway",
              "x": 1590,
              "y": 1200,
              "width": 160,
              "height": 90,
              "color": "#f472b6",
              "borderColor": "#facc15",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 13
            },
            {
              "id": "n14",
              "type": "rect",
              "label": "Load Balancer",
              "x": 1000,
              "y": 390,
              "width": 140,
              "height": 80,
              "color": "#facc15",
              "borderColor": "#22d3ee",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n15",
              "type": "rect",
              "label": "Frontend App",
              "x": 740,
              "y": 320,
              "width": 140,
              "height": 80,
              "color": "#22d3ee",
              "borderColor": "#a78bfa",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n16",
              "type": "rect",
              "label": "CDN / Edge",
              "x": 1260,
              "y": 320,
              "width": 140,
              "height": 80,
              "color": "#4ade80",
              "borderColor": "#f472b6",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 14
            },
            {
              "id": "n17",
              "type": "rect",
              "label": "Monitoring (Prometheus)",
              "x": 710,
              "y": 1110,
              "width": 140,
              "height": 90,
              "color": "#f472b6",
              "borderColor": "#22d3ee",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 13
            },
            {
              "id": "n18",
              "type": "rect",
              "label": "Tracing (Jaeger)",
              "x": 870,
              "y": 1450,
              "width": 140,
              "height": 90,
              "color": "#a78bfa",
              "borderColor": "#4ade80",
              "borderWidth": 2,
              "labelColor": "#ffffff",
              "fontSize": 13
            },
            {
              "id": "n19",
              "type": "rect",
              "label": "CI/CD (GitLab CI)",
              "x": 630,
              "y": 680,
              "width": 140,
              "height": 80,
              "color": "#facc15",
              "borderColor": "#a78bfa",
              "borderWidth": 2,
              "labelColor": "#000000",
              "fontSize": 13
            },
            {
              "id": "n20",
              "type": "text",
              "label": "Microservices Cluster (centered)",
              "x": 1000,
              "y": 1100,
              "width": 160,
              "height": 40,
              "color": "#000000",
              "borderColor": "#000000",
              "borderWidth": 0,
              "labelColor": "#22d3ee",
              "fontSize": 12
            }
          ],
          "links": [
            {
              "id": "l1",
              "sourceId": "n15",
              "targetId": "n16",
              "color": "#22d3ee",
              "width": 3,
              "trafficSpeed": 1.2,
              "trafficDensity": 0.04
            },
            {
              "id": "l2",
              "sourceId": "n15",
              "targetId": "n14",
              "color": "#facc15",
              "width": 3,
              "trafficSpeed": 1,
              "trafficDensity": 0.05
            },
            {
              "id": "l3",
              "sourceId": "n14",
              "targetId": "n2",
              "color": "#f472b6",
              "width": 3,
              "trafficSpeed": 1.1,
              "trafficDensity": 0.06
            },
            {
              "id": "l4",
              "sourceId": "n2",
              "targetId": "n3",
              "color": "#a78bfa",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.03
            },
            {
              "id": "l5",
              "sourceId": "n2",
              "targetId": "n4",
              "color": "#4ade80",
              "width": 3,
              "trafficSpeed": 1,
              "trafficDensity": 0.06
            },
            {
              "id": "l6",
              "sourceId": "n2",
              "targetId": "n5",
              "color": "#facc15",
              "width": 3,
              "trafficSpeed": 1.4,
              "trafficDensity": 0.07
            },
            {
              "id": "l7",
              "sourceId": "n2",
              "targetId": "n6",
              "color": "#22d3ee",
              "width": 3,
              "trafficSpeed": 1,
              "trafficDensity": 0.05
            },
            {
              "id": "l8",
              "sourceId": "n2",
              "targetId": "n7",
              "color": "#f472b6",
              "width": 3,
              "trafficSpeed": 1.3,
              "trafficDensity": 0.04
            },
            {
              "id": "l9",
              "sourceId": "n5",
              "targetId": "n6",
              "color": "#a78bfa",
              "width": 2,
              "trafficSpeed": 1.1,
              "trafficDensity": 0.03
            },
            {
              "id": "l10",
              "sourceId": "n5",
              "targetId": "n9",
              "color": "#4ade80",
              "width": 3,
              "trafficSpeed": 0.9,
              "trafficDensity": 0.06
            },
            {
              "id": "l11",
              "sourceId": "n4",
              "targetId": "n9",
              "color": "#22d3ee",
              "width": 2,
              "trafficSpeed": 0.8,
              "trafficDensity": 0.03
            },
            {
              "id": "l12",
              "sourceId": "n5",
              "targetId": "n10",
              "color": "#facc15",
              "width": 2,
              "trafficSpeed": 0.9,
              "trafficDensity": 0.04
            },
            {
              "id": "l13",
              "sourceId": "n7",
              "targetId": "n13",
              "color": "#f472b6",
              "width": 3,
              "trafficSpeed": 1.8,
              "trafficDensity": 0.03
            },
            {
              "id": "l14",
              "sourceId": "n8",
              "targetId": "n12",
              "color": "#a78bfa",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.02
            },
            {
              "id": "l15",
              "sourceId": "n12",
              "targetId": "n5",
              "color": "#22d3ee",
              "width": 3,
              "trafficSpeed": 1.2,
              "trafficDensity": 0.05
            },
            {
              "id": "l16",
              "sourceId": "n5",
              "targetId": "n12",
              "color": "#facc15",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.04
            },
            {
              "id": "l17",
              "sourceId": "n4",
              "targetId": "n10",
              "color": "#4ade80",
              "width": 2,
              "trafficSpeed": 0.8,
              "trafficDensity": 0.03
            },
            {
              "id": "l18",
              "sourceId": "n1",
              "targetId": "n3",
              "color": "#a78bfa",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.02
            },
            {
              "id": "l19",
              "sourceId": "n1",
              "targetId": "n4",
              "color": "#22d3ee",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.03
            },
            {
              "id": "l20",
              "sourceId": "n1",
              "targetId": "n5",
              "color": "#f472b6",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.03
            },
            {
              "id": "l21",
              "sourceId": "n1",
              "targetId": "n6",
              "color": "#facc15",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.03
            },
            {
              "id": "l22",
              "sourceId": "n1",
              "targetId": "n7",
              "color": "#4ade80",
              "width": 2,
              "trafficSpeed": 1,
              "trafficDensity": 0.02
            },
            {
              "id": "l23",
              "sourceId": "n17",
              "targetId": "n1",
              "color": "#f472b6",
              "width": 2,
              "trafficSpeed": 0.7,
              "trafficDensity": 0.02
            },
            {
              "id": "l24",
              "sourceId": "n18",
              "targetId": "n1",
              "color": "#a78bfa",
              "width": 2,
              "trafficSpeed": 0.6,
              "trafficDensity": 0.02
            },
            {
              "id": "l25",
              "sourceId": "n19",
              "targetId": "n2",
              "color": "#facc15",
              "width": 2,
              "trafficSpeed": 0.9,
              "trafficDensity": 0.01
            }
          ],
          "globalSettings": {
            "cornerRadius": 0,
            "globalSpeed": 1
          }
        }
    },
    {
        id: 'empty',
        name: 'Empty Canvas',
        description: 'Start from scratch with a blank slate.',
        data: {
            nodes: [],
            links: [],
            globalSettings: { cornerRadius: 24, globalSpeed: 1 }
        }
    }
];