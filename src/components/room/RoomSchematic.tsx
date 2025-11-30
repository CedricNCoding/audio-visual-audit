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
  "Placo": "fill-gray-400/30",
  "Béton": "fill-slate-500/30",
  "Brique": "fill-red-600/30",
  "Vitrage": "fill-blue-400/30",
  "Rideaux / tentures": "fill-purple-400/30",
  "Bois": "fill-amber-600/30",
  "Panneaux acoustiques": "fill-green-500/30",
  "Autre": "fill-orange-400/30",
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
  const [openWall, setOpenWall] = useState<"A" | "B" | "C" | "D" | null>(null);

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
    if (!material) return "fill-muted/20";
    return MATERIAL_COLORS[material] || "fill-muted/20";
  };

  const getWallStyle = (wall: "A" | "B" | "C" | "D", material?: string) => {
    const fillColor = getWallColor(material);
    const isPrincipal = murPrincipal === wall;
    const strokeWidth = isPrincipal ? "stroke-[4]" : "stroke-2";
    const strokeColor = isPrincipal ? "stroke-primary" : "stroke-border";
    return `${fillColor} ${strokeColor} ${strokeWidth} cursor-pointer hover:brightness-110 transition-all`;
  };

  const handleWallSelect = (wall: "A" | "B" | "C" | "D", material: string) => {
    onWallChange(wall, material);
    setOpenWall(null);
  };

  return (
    <div className="space-y-4">
      <div className="glass neon-border-yellow p-6 rounded-lg">
        <h3 className="text-lg font-semibold neon-yellow mb-4">
          📐 Schéma simplifié de la salle (vue de dessus)
        </h3>
        
        <div className="flex justify-center mb-4">
          <svg width={svgWidth + 100} height={svgHeight + 140} className="border border-border/20 rounded-lg bg-background/20">
            {/* Mur A (haut) */}
            <Popover open={openWall === "A"} onOpenChange={(open) => !open && setOpenWall(null)}>
              <PopoverTrigger asChild>
                <g className="cursor-pointer" onClick={() => setOpenWall("A")}>
                  <rect
                    x="50"
                    y="50"
                    width={svgWidth}
                    height="20"
                    className={getWallStyle("A", murA)}
                  />
                  <text
                    x={50 + svgWidth / 2}
                    y="40"
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                  >
                    {murA ? `A - ${murA}` : "A"}{murPrincipal === "A" && " 🖥️"}
                  </text>
                </g>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-50">
                <div className="space-y-3">
                  <h4 className="font-medium">Mur A (haut)</h4>
                  <div className="space-y-2">
                    <Label>Matériau</Label>
                    <Select 
                      value={murA || ""} 
                      onValueChange={(value) => handleWallSelect("A", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un matériau" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_OPTIONS.map((mat) => (
                          <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onPrincipalWallChange("A");
                      setOpenWall(null);
                    }}
                  >
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Mur B (droite) */}
            <Popover open={openWall === "B"} onOpenChange={(open) => !open && setOpenWall(null)}>
              <PopoverTrigger asChild>
                <g className="cursor-pointer" onClick={() => setOpenWall("B")}>
                  <rect
                    x={50 + svgWidth}
                    y="70"
                    width="20"
                    height={svgHeight}
                    className={getWallStyle("B", murB)}
                  />
                  <text
                    x={85 + svgWidth}
                    y={70 + svgHeight / 2}
                    textAnchor="start"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                  >
                    {murB ? `B - ${murB}` : "B"}{murPrincipal === "B" && " 🖥️"}
                  </text>
                </g>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-50">
                <div className="space-y-3">
                  <h4 className="font-medium">Mur B (droite)</h4>
                  <div className="space-y-2">
                    <Label>Matériau</Label>
                    <Select 
                      value={murB || ""} 
                      onValueChange={(value) => handleWallSelect("B", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un matériau" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_OPTIONS.map((mat) => (
                          <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onPrincipalWallChange("B");
                      setOpenWall(null);
                    }}
                  >
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Mur C (bas) */}
            <Popover open={openWall === "C"} onOpenChange={(open) => !open && setOpenWall(null)}>
              <PopoverTrigger asChild>
                <g className="cursor-pointer" onClick={() => setOpenWall("C")}>
                  <rect
                    x="50"
                    y={70 + svgHeight}
                    width={svgWidth}
                    height="20"
                    className={getWallStyle("C", murC)}
                  />
                  <text
                    x={50 + svgWidth / 2}
                    y={105 + svgHeight}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                  >
                    {murC ? `C - ${murC}` : "C"}{murPrincipal === "C" && " 🖥️"}
                  </text>
                </g>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-50">
                <div className="space-y-3">
                  <h4 className="font-medium">Mur C (bas)</h4>
                  <div className="space-y-2">
                    <Label>Matériau</Label>
                    <Select 
                      value={murC || ""} 
                      onValueChange={(value) => handleWallSelect("C", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un matériau" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_OPTIONS.map((mat) => (
                          <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onPrincipalWallChange("C");
                      setOpenWall(null);
                    }}
                  >
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Mur D (gauche) */}
            <Popover open={openWall === "D"} onOpenChange={(open) => !open && setOpenWall(null)}>
              <PopoverTrigger asChild>
                <g className="cursor-pointer" onClick={() => setOpenWall("D")}>
                  <rect
                    x="30"
                    y="70"
                    width="20"
                    height={svgHeight}
                    className={getWallStyle("D", murD)}
                  />
                  <text
                    x="20"
                    y={70 + svgHeight / 2}
                    textAnchor="end"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                  >
                    {murD ? `D - ${murD}` : "D"}{murPrincipal === "D" && " 🖥️"}
                  </text>
                </g>
              </PopoverTrigger>
              <PopoverContent className="w-80 z-50">
                <div className="space-y-3">
                  <h4 className="font-medium">Mur D (gauche)</h4>
                  <div className="space-y-2">
                    <Label>Matériau</Label>
                    <Select 
                      value={murD || ""} 
                      onValueChange={(value) => handleWallSelect("D", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un matériau" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_OPTIONS.map((mat) => (
                          <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onPrincipalWallChange("D");
                      setOpenWall(null);
                    }}
                  >
                    Définir comme mur principal
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Dimensions */}
            <text x={50 + svgWidth / 2} y={125 + svgHeight} textAnchor="middle" className="fill-muted-foreground text-xs">
              {widthM} m
            </text>
            <text x={15} y={70 + svgHeight / 2} textAnchor="middle" className="fill-muted-foreground text-xs" transform={`rotate(-90 15 ${70 + svgHeight / 2})`}>
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
