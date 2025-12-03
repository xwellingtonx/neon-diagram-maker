
export interface Coordinate {
    x: number;
    y: number;
}

export interface Node {
    id: string;
    type: 'circle' | 'rect' | 'text' | 'svg';
    label: string;
    x: number;
    y: number;
    width: number;  // For rect: width, For circle: diameter (2*radius)
    height: number; // For rect: height, For circle: diameter
    color: string;
    borderColor: string;
    borderWidth: number;
    borderStyle?: 'solid' | 'dashed';
    labelColor: string;
    fontSize: number;
    iconName?: string; // New: Lucide icon name
    iconColor?: string; // New: Icon specific color
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    color: string;
    width: number;
    path?: string; // Optional on import, calculated by app
    label?: string; // New: Link label
    labelSize?: number; // New: Font size for label
    labelColor?: string; // New: Color for label text
    showLabelBackground?: boolean; // New: Toggle label container background
    trafficSpeed: number; // 1 = normal
    trafficDensity: number; // probability of spawn
}

export interface Signal {
    id: string;
    linkId: string;
    progress: number; // 0.0 to 1.0
    speed: number;
    color: string;
}

export interface DiagramData {
    nodes: Node[];
    links: Link[];
    globalSettings?: {
        cornerRadius: number;
        globalSpeed: number;
    };
}
