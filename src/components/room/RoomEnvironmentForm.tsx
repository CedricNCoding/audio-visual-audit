import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RoomSchematic } from "./RoomSchematic";
import { RoomPlanEditor } from "./RoomPlanEditor";
import { Panel, InputField } from "@/components/design-system";

interface RoomEnvironmentData {
  length_m?: number;
  width_m?: number;
  height_m?: number;
  wall_material?: string;
  floor_material?: string;
  ceiling_material?: string;
  has_raised_floor?: boolean;
  has_false_ceiling?: boolean;
  brightness_level?: string;
  has_acoustic_issue?: boolean;
  acoustic_comment?: string;
  mur_a_materiau?: string;
  mur_b_materiau?: string;
  mur_c_materiau?: string;
  mur_d_materiau?: string;
  mur_principal?: string;
  has_rj45?: boolean;
  rj45_count?: number;
}

interface RoomEnvironmentFormProps {
  data: RoomEnvironmentData;
  onChange: (data: RoomEnvironmentData) => void;
  roomId: string;
}

export const RoomEnvironmentForm = ({ data, onChange, roomId }: RoomEnvironmentFormProps) => {
  const updateField = (field: keyof RoomEnvironmentData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Dimensions */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '0ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Dimensions
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <InputField
              label="Longueur (m)"
              type="number"
              step={0.1}
              value={data.length_m || ""}
              onChange={(e) => updateField("length_m", parseFloat(e.target.value) || undefined)}
              focusGlow="yellow"
            />
            <InputField
              label="Largeur (m)"
              type="number"
              step={0.1}
              value={data.width_m || ""}
              onChange={(e) => updateField("width_m", parseFloat(e.target.value) || undefined)}
              focusGlow="yellow"
            />
            <InputField
              label="Hauteur (m)"
              type="number"
              step={0.1}
              value={data.height_m || ""}
              onChange={(e) => updateField("height_m", parseFloat(e.target.value) || undefined)}
              focusGlow="yellow"
            />
          </div>
        </div>
      </Panel>

      {/* Section Caractéristiques techniques */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '40ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Caractéristiques techniques
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
              <Checkbox
                id="raised_floor"
                checked={data.has_raised_floor || false}
                onCheckedChange={(checked) => updateField("has_raised_floor", checked)}
                className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
              />
              <label htmlFor="raised_floor" className="text-sm cursor-pointer text-foreground">
                Plancher technique
              </label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
              <Checkbox
                id="false_ceiling"
                checked={data.has_false_ceiling || false}
                onCheckedChange={(checked) => updateField("has_false_ceiling", checked)}
                className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
              />
              <label htmlFor="false_ceiling" className="text-sm cursor-pointer text-foreground">
                Faux plafond technique
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Luminosité</Label>
            <Select
              value={data.brightness_level || ""}
              onValueChange={(value) => updateField("brightness_level", value)}
            >
              <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faible">Faible</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="forte">Forte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      {/* Section Réseau */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '80ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Réseau
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="has_rj45"
              checked={data.has_rj45 || false}
              onCheckedChange={(checked) => updateField("has_rj45", checked)}
              className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
            />
            <label htmlFor="has_rj45" className="text-sm cursor-pointer text-foreground">
              Liaison réseau RJ45 existante
            </label>
          </div>
          {data.has_rj45 && (
            <div className="ml-4 animate-fade-in">
              <InputField
                label="Nombre de prises RJ45 disponibles"
                type="number"
                min={0}
                value={data.rj45_count || ""}
                onChange={(e) => updateField("rj45_count", parseInt(e.target.value) || 0)}
                className="w-32"
                focusGlow="yellow"
              />
            </div>
          )}
        </div>
      </Panel>

      {/* Section Acoustique */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '120ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Acoustique
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="acoustic_issue"
              checked={data.has_acoustic_issue || false}
              onCheckedChange={(checked) => updateField("has_acoustic_issue", checked)}
              className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <label htmlFor="acoustic_issue" className="text-sm cursor-pointer text-foreground">
              Problème acoustique
            </label>
          </div>
          {data.has_acoustic_issue && (
            <div className="animate-fade-in">
              <Textarea
                placeholder="Décrivez le problème acoustique..."
                value={data.acoustic_comment || ""}
                onChange={(e) => updateField("acoustic_comment", e.target.value)}
                rows={3}
                className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all resize-none"
              />
            </div>
          )}
        </div>
      </Panel>

      {/* Schéma de la salle */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '160ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Schéma de la salle
          </h3>
          <RoomSchematic
            lengthM={data.length_m}
            widthM={data.width_m}
            murA={data.mur_a_materiau}
            murB={data.mur_b_materiau}
            murC={data.mur_c_materiau}
            murD={data.mur_d_materiau}
            murPrincipal={data.mur_principal}
            onWallChange={(wall, material) => {
              const fieldMap = {
                A: 'mur_a_materiau' as const,
                B: 'mur_b_materiau' as const,
                C: 'mur_c_materiau' as const,
                D: 'mur_d_materiau' as const,
              };
              updateField(fieldMap[wall], material);
            }}
            onPrincipalWallChange={(wall) => {
              updateField("mur_principal", wall);
            }}
          />
        </div>
      </Panel>

      {/* Formulaire texte récapitulatif */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '200ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Récapitulatif des murs
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { id: "mur_a", field: "mur_a_materiau" as const, label: "Mur A (haut)" },
              { id: "mur_b", field: "mur_b_materiau" as const, label: "Mur B (droite)" },
              { id: "mur_c", field: "mur_c_materiau" as const, label: "Mur C (bas)" },
              { id: "mur_d", field: "mur_d_materiau" as const, label: "Mur D (gauche)" },
            ].map((wall) => (
              <div key={wall.id} className="space-y-2">
                <Label htmlFor={wall.id} className="text-sm text-muted-foreground">{wall.label}</Label>
                <Select
                  value={data[wall.field] || ""}
                  onValueChange={(value) => updateField(wall.field, value)}
                >
                  <SelectTrigger id={wall.id} className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
                    <SelectValue placeholder="Matériau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Placo">Placo</SelectItem>
                    <SelectItem value="Béton">Béton</SelectItem>
                    <SelectItem value="Brique">Brique</SelectItem>
                    <SelectItem value="Vitrage">Vitrage</SelectItem>
                    <SelectItem value="Rideaux / tentures">Rideaux / tentures</SelectItem>
                    <SelectItem value="Bois">Bois</SelectItem>
                    <SelectItem value="Panneaux acoustiques">Panneaux acoustiques</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mur_principal" className="text-sm text-muted-foreground">Mur principal (diffuseur)</Label>
            <Select
              value={data.mur_principal || ""}
              onValueChange={(value) => updateField("mur_principal", value)}
            >
              <SelectTrigger id="mur_principal" className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-yellow/50 focus:shadow-glow-yellow transition-all">
                <SelectValue placeholder="Choisir le mur principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Mur A (haut)</SelectItem>
                <SelectItem value="B">Mur B (droite)</SelectItem>
                <SelectItem value="C">Mur C (bas)</SelectItem>
                <SelectItem value="D">Mur D (gauche)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      {/* Plan d'implantation des éléments */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '240ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Plan d'implantation
          </h3>
          <RoomPlanEditor
            roomId={roomId}
            roomLength={data.length_m}
            roomWidth={data.width_m}
          />
        </div>
      </Panel>
    </div>
  );
};
