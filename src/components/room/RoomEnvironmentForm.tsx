import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RoomSchematic } from "./RoomSchematic";

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
}

interface RoomEnvironmentFormProps {
  data: RoomEnvironmentData;
  onChange: (data: RoomEnvironmentData) => void;
}

export const RoomEnvironmentForm = ({ data, onChange }: RoomEnvironmentFormProps) => {
  const updateField = (field: keyof RoomEnvironmentData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Dimensions</Label>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="length" className="text-sm text-muted-foreground">
              Longueur (m)
            </Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              value={data.length_m || ""}
              onChange={(e) => updateField("length_m", parseFloat(e.target.value) || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width" className="text-sm text-muted-foreground">
              Largeur (m)
            </Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              value={data.width_m || ""}
              onChange={(e) => updateField("width_m", parseFloat(e.target.value) || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm text-muted-foreground">
              Hauteur (m)
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={data.height_m || ""}
              onChange={(e) => updateField("height_m", parseFloat(e.target.value) || undefined)}
            />
          </div>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="raised_floor"
            checked={data.has_raised_floor || false}
            onCheckedChange={(checked) => updateField("has_raised_floor", checked)}
          />
          <label htmlFor="raised_floor" className="text-sm cursor-pointer">
            Plancher technique
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="false_ceiling"
            checked={data.has_false_ceiling || false}
            onCheckedChange={(checked) => updateField("has_false_ceiling", checked)}
          />
          <label htmlFor="false_ceiling" className="text-sm cursor-pointer">
            Faux plafond technique
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Luminosité</Label>
        <Select
          value={data.brightness_level || ""}
          onValueChange={(value) => updateField("brightness_level", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="faible">Faible</SelectItem>
            <SelectItem value="moyenne">Moyenne</SelectItem>
            <SelectItem value="forte">Forte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acoustic_issue"
            checked={data.has_acoustic_issue || false}
            onCheckedChange={(checked) => updateField("has_acoustic_issue", checked)}
          />
          <label htmlFor="acoustic_issue" className="text-sm cursor-pointer">
            Problème acoustique
          </label>
        </div>
        {data.has_acoustic_issue && (
          <Textarea
            placeholder="Décrivez le problème acoustique..."
            value={data.acoustic_comment || ""}
            onChange={(e) => updateField("acoustic_comment", e.target.value)}
            rows={3}
          />
        )}
      </div>

      {/* Schéma de la salle */}
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

      {/* Formulaire texte récapitulatif */}
      <div className="glass neon-border-blue p-4 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold neon-blue">Récapitulatif des murs</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mur_a" className="text-sm">Mur A (haut)</Label>
            <Select
              value={data.mur_a_materiau || ""}
              onValueChange={(value) => updateField("mur_a_materiau", value)}
            >
              <SelectTrigger id="mur_a">
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
          <div className="space-y-2">
            <Label htmlFor="mur_b" className="text-sm">Mur B (droite)</Label>
            <Select
              value={data.mur_b_materiau || ""}
              onValueChange={(value) => updateField("mur_b_materiau", value)}
            >
              <SelectTrigger id="mur_b">
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
          <div className="space-y-2">
            <Label htmlFor="mur_c" className="text-sm">Mur C (bas)</Label>
            <Select
              value={data.mur_c_materiau || ""}
              onValueChange={(value) => updateField("mur_c_materiau", value)}
            >
              <SelectTrigger id="mur_c">
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
          <div className="space-y-2">
            <Label htmlFor="mur_d" className="text-sm">Mur D (gauche)</Label>
            <Select
              value={data.mur_d_materiau || ""}
              onValueChange={(value) => updateField("mur_d_materiau", value)}
            >
              <SelectTrigger id="mur_d">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="mur_principal" className="text-sm">Mur principal (diffuseur)</Label>
          <Select
            value={data.mur_principal || ""}
            onValueChange={(value) => updateField("mur_principal", value)}
          >
            <SelectTrigger id="mur_principal">
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
    </div>
  );
};
