import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SynopticDiagramProps {
  roomId: string;
}

// Colors for different signal types
const SIGNAL_COLORS: Record<string, string> = {
  "Vidéo HDMI": "#3b82f6",
  "Vidéo HDBaseT": "#8b5cf6",
  "Vidéo IP / AVoIP": "#06b6d4",
  "USB": "#22c55e",
  "Audio analogique": "#f59e0b",
  "Audio numérique / Dante": "#ef4444",
  "Réseau RJ45": "#64748b",
};

// Node types for positioning
type NodeType = "source" | "matrix" | "selector" | "dsp" | "display" | "speaker" | "zone";

interface DiagramNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

interface DiagramLink {
  from: string;
  to: string;
  signalType: string;
  transport: string;
  distance?: number;
}

export const SynopticDiagram = ({ roomId }: SynopticDiagramProps) => {
  const { data: cables } = useQuery({
    queryKey: ["cables", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cables")
        .select("*")
        .eq("room_id", roomId)
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: sources } = useQuery({
    queryKey: ["sources", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sources").select("*").eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const { data: displays } = useQuery({
    queryKey: ["displays", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from("displays").select("*").eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  // Build the diagram data from cables
  const diagramData = useMemo(() => {
    if (!cables || cables.length === 0) return null;

    const nodesMap = new Map<string, DiagramNode>();
    const links: DiagramLink[] = [];

    // Classify nodes by analyzing cable connections
    const classifyNode = (name: string): NodeType => {
      const lower = name.toLowerCase();
      if (lower.includes("matrice")) return "matrix";
      if (lower.includes("sélecteur") || lower.includes("selecteur")) return "selector";
      if (lower.includes("dsp") || lower.includes("mixeur") || lower.includes("amplification")) return "dsp";
      if (lower.includes("enceinte") || lower.includes("speaker")) return "speaker";
      if (lower.includes("zone") || lower.includes("hdmi") || lower.includes("usb-c") || lower.includes("displayport")) return "zone";
      
      // Check if it's a source or display based on data
      const isSource = sources?.some(s => 
        s.source_type.toLowerCase() === lower || lower.includes(s.source_type.toLowerCase())
      );
      if (isSource) return "source";
      
      const isDisplay = displays?.some(d => 
        d.display_type.toLowerCase() === lower || lower.includes(d.display_type.toLowerCase())
      );
      if (isDisplay) return "display";
      
      // Default based on keywords
      if (lower.includes("écran") || lower.includes("vidéoprojecteur") || lower.includes("moniteur") || lower.includes("tv")) return "display";
      if (lower.includes("pc") || lower.includes("player") || lower.includes("codec") || lower.includes("ordinateur")) return "source";
      
      return "source";
    };

    // Collect all unique nodes
    cables.forEach(cable => {
      if (!nodesMap.has(cable.point_a)) {
        nodesMap.set(cable.point_a, {
          id: cable.point_a,
          label: cable.point_a,
          type: classifyNode(cable.point_a),
          x: 0,
          y: 0,
        });
      }
      if (!nodesMap.has(cable.point_b)) {
        nodesMap.set(cable.point_b, {
          id: cable.point_b,
          label: cable.point_b,
          type: classifyNode(cable.point_b),
          x: 0,
          y: 0,
        });
      }

      links.push({
        from: cable.point_a,
        to: cable.point_b,
        signalType: cable.signal_type,
        transport: cable.transport || "",
        distance: cable.distance_m,
      });
    });

    const nodes = Array.from(nodesMap.values());

    // Position nodes based on type (left to right flow)
    const typeColumns: Record<NodeType, number> = {
      source: 0,
      zone: 0.5,
      selector: 1,
      matrix: 1.5,
      dsp: 2,
      display: 2.5,
      speaker: 3,
    };

    // Group nodes by type
    const nodesByType = new Map<NodeType, DiagramNode[]>();
    nodes.forEach(node => {
      const existing = nodesByType.get(node.type) || [];
      existing.push(node);
      nodesByType.set(node.type, existing);
    });

    // Calculate positions
    const svgWidth = 900;
    const svgHeight = 500;
    const padding = 80;

    const maxCol = Math.max(...Object.values(typeColumns));
    const colWidth = (svgWidth - padding * 2) / maxCol;

    nodesByType.forEach((typeNodes, type) => {
      const col = typeColumns[type];
      const x = padding + col * colWidth;
      const rowHeight = (svgHeight - padding * 2) / (typeNodes.length + 1);
      
      typeNodes.forEach((node, idx) => {
        node.x = x;
        node.y = padding + (idx + 1) * rowHeight;
      });
    });

    return { nodes, links };
  }, [cables, sources, displays]);

  const downloadSVG = () => {
    const svgElement = document.getElementById("synoptic-diagram-svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema-synoptique.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!diagramData || diagramData.nodes.length === 0) {
    return (
      <Card className="glass neon-border">
        <CardHeader>
          <CardTitle className="text-lg neon-cyan">🔗 Schéma Synoptique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune liaison définie. Ajoutez des câbles pour générer le schéma synoptique.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { nodes, links } = diagramData;

  // Get node shape based on type
  const getNodeShape = (node: DiagramNode) => {
    const colors: Record<NodeType, { fill: string; stroke: string }> = {
      source: { fill: "hsl(var(--primary) / 0.2)", stroke: "hsl(var(--primary))" },
      zone: { fill: "hsl(var(--secondary) / 0.2)", stroke: "hsl(var(--secondary))" },
      selector: { fill: "hsl(45 100% 50% / 0.2)", stroke: "hsl(45 100% 50%)" },
      matrix: { fill: "hsl(280 100% 50% / 0.2)", stroke: "hsl(280 100% 50%)" },
      dsp: { fill: "hsl(0 100% 50% / 0.2)", stroke: "hsl(0 100% 50%)" },
      display: { fill: "hsl(160 100% 40% / 0.2)", stroke: "hsl(160 100% 40%)" },
      speaker: { fill: "hsl(30 100% 50% / 0.2)", stroke: "hsl(30 100% 50%)" },
    };

    const { fill, stroke } = colors[node.type];
    const width = Math.max(100, node.label.length * 7);
    const height = 40;

    return (
      <g key={node.id}>
        <rect
          x={node.x - width / 2}
          y={node.y - height / 2}
          width={width}
          height={height}
          rx={node.type === "matrix" || node.type === "selector" ? 0 : 8}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          fill="currentColor"
          fontSize={11}
          fontWeight="500"
          className="select-none"
        >
          {node.label.length > 18 ? node.label.substring(0, 16) + "..." : node.label}
        </text>
      </g>
    );
  };

  // Calculate link path
  const getLinkPath = (link: DiagramLink) => {
    const fromNode = nodes.find(n => n.id === link.from);
    const toNode = nodes.find(n => n.id === link.to);
    if (!fromNode || !toNode) return null;

    const fromWidth = Math.max(100, fromNode.label.length * 7) / 2;
    const toWidth = Math.max(100, toNode.label.length * 7) / 2;

    const x1 = fromNode.x + fromWidth;
    const y1 = fromNode.y;
    const x2 = toNode.x - toWidth;
    const y2 = toNode.y;

    // Curved path
    const midX = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    const color = SIGNAL_COLORS[link.signalType] || "#888";

    return (
      <g key={`${link.from}-${link.to}-${link.signalType}`}>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.8}
          markerEnd="url(#arrowhead)"
        />
        {link.distance && (
          <text
            x={midX}
            y={(y1 + y2) / 2 - 8}
            textAnchor="middle"
            fill={color}
            fontSize={9}
            className="select-none"
          >
            {link.distance}m
          </text>
        )}
      </g>
    );
  };

  // Legend items
  const legendItems = Array.from(
    new Set(links.map(l => l.signalType))
  ).map(type => ({
    type,
    color: SIGNAL_COLORS[type] || "#888",
  }));

  return (
    <Card className="glass neon-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg neon-cyan">🔗 Schéma Synoptique</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadSVG} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger SVG
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            id="synoptic-diagram-svg"
            viewBox="0 0 900 500"
            className="w-full min-w-[700px] h-auto"
            style={{ minHeight: 400 }}
          >
            {/* Definitions */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" opacity="0.5" />
              </marker>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill="transparent" />

            {/* Column labels */}
            <text x={80} y={30} fill="currentColor" fontSize={11} opacity={0.5}>Sources</text>
            <text x={250} y={30} fill="currentColor" fontSize={11} opacity={0.5}>Sélection</text>
            <text x={440} y={30} fill="currentColor" fontSize={11} opacity={0.5}>Distribution</text>
            <text x={650} y={30} fill="currentColor" fontSize={11} opacity={0.5}>Diffusion</text>

            {/* Links */}
            <g className="links">
              {links.map(link => getLinkPath(link))}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {nodes.map(node => getNodeShape(node))}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {legendItems.map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-4 h-1 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
