import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Matériaux murs</Label>
          <Input
            value={data.wall_material || ""}
            onChange={(e) => updateField("wall_material", e.target.value)}
            placeholder="Ex: Plâtre, bois..."
          />
        </div>
        <div className="space-y-2">
          <Label>Matériaux sol</Label>
          <Input
            value={data.floor_material || ""}
            onChange={(e) => updateField("floor_material", e.target.value)}
            placeholder="Ex: Moquette, carrelage..."
          />
        </div>
        <div className="space-y-2">
          <Label>Matériaux plafond</Label>
          <Input
            value={data.ceiling_material || ""}
            onChange={(e) => updateField("ceiling_material", e.target.value)}
            placeholder="Ex: Dalle, plâtre..."
          />
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
    </div>
  );
};
