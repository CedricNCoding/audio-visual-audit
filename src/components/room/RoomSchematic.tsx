import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MATERIAL_OPTIONS = [
  "Placo",
  "Béton",
  "Brique",
  "Vitrage",
  "Rideaux / tentures",
  "Bois",
  "Panneaux acoustiques",
  "Autre",
];

const MATERIAL_COLORS: Record<string, string> = {
  "Placo": "bg-gray-400/30 border-gray-400",
  "Béton": "bg-slate-500/30 border-slate-500",
  "Brique": "bg-red-600/30 border-red-600",
  "Vitrage": "bg-blue-400/30 border-blue-400",
  "Rideaux / tentures": "bg-purple-400/30 border-purple-400",
  "Bois": "bg-amber-600/30 border-amber-600",
  "Panneaux acoustiques": "bg-green-500/30 border-green-500",
  "Autre": "bg-orange-400/30 border-orange-400",
};

interface RoomSchematicProps {
  lengthM?: number;
  widthM?: number;
  murA?: string;
  murB?: string;
  murC?: string;
  murD?: string;
  murPrincipal?: string;
  onWallChange: (wall: "A" | "B" | "C" | "D", material: string) => void;
  onPrincipalWallChange: (wall: "A" | "B" | "C" | "D") => void;
}

export const RoomSchematic = ({
  lengthM,
  widthM,
  murA,
  murB,
  murC,
  murD,
  murPrincipal,
  onWallChange,
  onPrincipalWallChange,
}: RoomSchematicProps) => {
  const [selectedWall, setSelectedWall] = useState<"A" | "B" | "C" | "D" | null>(null);

  if (!lengthM || !widthM) {
    return (
      <div className="glass neon-border-yellow p-6 rounded-lg text-center">
        <p className="text-muted-foreground">
          ⚠️ Veuillez saisir longueur et largeur pour afficher le schéma.
        </p>
      </div>
    );
  }

  // Calculate proportional dimensions (max 400px width, maintain ratio)
  const maxWidth = 400;
  const ratio = widthM / lengthM;
  const svgWidth = Math.min(maxWidth, ratio > 1 ? maxWidth : maxWidth * ratio);
  const svgHeight = ratio > 1 ? svgWidth / ratio : svgWidth;

  const getWallColor = (material?: string) => {
    if (!material) return "stroke-border";
    return MATERIAL_COLORS[material] || "stroke-border";
  };

  const getWallStyle = (wall: "A" | "B" | "C" | "D", material?: string) => {
    const baseClass = material ? getWallColor(material) : "stroke-border";
    const isPrincipal = murPrincipal === wall;
    return `${baseClass} ${isPrincipal ? "stroke-[4px] neon-border-blue" : "stroke-[2px]"} fill-none cursor-pointer hover:opacity-80 transition-opacity`;
  };

  return (
    <div className="space-y-4">
      <div className="glass neon-border-yellow p-6 rounded-lg">
        <h3 className="text-lg font-semibold neon-yellow mb-4">
          📐 Schéma simplifié de la salle (vue de dessus)
        </h3>
        
        <div className="flex justify-center mb-4">
          <svg width={svgWidth + 100} height={svgHeight + 100} className="border border-border/20 rounded-lg bg-background/20">
            {/* Mur A (haut) */}
            <Popover open={selectedWall === "A"} onOpenChange={(open) => setSelectedWall(open ? "A" : null)}>
              <PopoverTrigger asChild>
                <line
                  x1={50}
                  y1={50}
                  x2={50 + svgWidth}
                  y2={50}
                  className={getWallStyle("A", murA)}
                  onClick={() => setSelectedWall("A")}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Label>Mur A (haut)</Label>
                  <Select value={murA || ""} onValueChange={(val) => onWallChange("A", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((mat) => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => onPrincipalWallChange("A")}>
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <text x={50 + svgWidth / 2} y={40} textAnchor="middle" className="fill-foreground text-xs">
              {murA ? `A - ${murA}` : "A"}
              {murPrincipal === "A" && " 🖥️"}
            </text>

            {/* Mur B (droite) */}
            <Popover open={selectedWall === "B"} onOpenChange={(open) => setSelectedWall(open ? "B" : null)}>
              <PopoverTrigger asChild>
                <line
                  x1={50 + svgWidth}
                  y1={50}
                  x2={50 + svgWidth}
                  y2={50 + svgHeight}
                  className={getWallStyle("B", murB)}
                  onClick={() => setSelectedWall("B")}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Label>Mur B (droite)</Label>
                  <Select value={murB || ""} onValueChange={(val) => onWallChange("B", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((mat) => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => onPrincipalWallChange("B")}>
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <text x={60 + svgWidth} y={50 + svgHeight / 2} textAnchor="start" className="fill-foreground text-xs">
              {murB ? `B - ${murB}` : "B"}
              {murPrincipal === "B" && " 🖥️"}
            </text>

            {/* Mur C (bas) */}
            <Popover open={selectedWall === "C"} onOpenChange={(open) => setSelectedWall(open ? "C" : null)}>
              <PopoverTrigger asChild>
                <line
                  x1={50}
                  y1={50 + svgHeight}
                  x2={50 + svgWidth}
                  y2={50 + svgHeight}
                  className={getWallStyle("C", murC)}
                  onClick={() => setSelectedWall("C")}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Label>Mur C (bas)</Label>
                  <Select value={murC || ""} onValueChange={(val) => onWallChange("C", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((mat) => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => onPrincipalWallChange("C")}>
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <text x={50 + svgWidth / 2} y={65 + svgHeight} textAnchor="middle" className="fill-foreground text-xs">
              {murC ? `C - ${murC}` : "C"}
              {murPrincipal === "C" && " 🖥️"}
            </text>

            {/* Mur D (gauche) */}
            <Popover open={selectedWall === "D"} onOpenChange={(open) => setSelectedWall(open ? "D" : null)}>
              <PopoverTrigger asChild>
                <line
                  x1={50}
                  y1={50}
                  x2={50}
                  y2={50 + svgHeight}
                  className={getWallStyle("D", murD)}
                  onClick={() => setSelectedWall("D")}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Label>Mur D (gauche)</Label>
                  <Select value={murD || ""} onValueChange={(val) => onWallChange("D", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((mat) => (
                        <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => onPrincipalWallChange("D")}>
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <text x={40} y={50 + svgHeight / 2} textAnchor="end" className="fill-foreground text-xs">
              {murD ? `D - ${murD}` : "D"}
              {murPrincipal === "D" && " 🖥️"}
            </text>

            {/* Dimensions */}
            <text x={50 + svgWidth / 2} y={svgHeight + 85} textAnchor="middle" className="fill-muted-foreground text-xs">
              {widthM} m
            </text>
            <text x={25} y={50 + svgHeight / 2} textAnchor="middle" className="fill-muted-foreground text-xs" transform={`rotate(-90 25 ${50 + svgHeight / 2})`}>
              {lengthM} m
            </text>
          </svg>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 Cliquez sur un mur pour définir son matériau et le désigner comme mur principal
        </p>
      </div>
    </div>
  );
};
