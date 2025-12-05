import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface RoomUsageData {
  main_usage?: string;
  usage_intensity?: string;
  user_skill_level?: string;
  platform_type?: string;
  automation_booking?: boolean;
  automation_lighting?: boolean;
  automation_acoustic?: boolean;
  reservation_salle?: boolean;
  nombre_personnes?: number;
  depose_materiel?: boolean;
  rapatriement_materiel?: boolean;
  formation_demandee?: boolean;
}

interface RoomUsageFormProps {
  data: RoomUsageData;
  onChange: (data: RoomUsageData) => void;
}

export const RoomUsageForm = ({ data, onChange }: RoomUsageFormProps) => {
  const updateField = (field: keyof RoomUsageData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Usage principal</Label>
        <Input
          value={data.main_usage || ""}
          onChange={(e) => updateField("main_usage", e.target.value)}
          placeholder="Ex: Réunions d'équipe, formations..."
        />
      </div>

      <div className="space-y-2">
        <Label>Intensité d'usage</Label>
        <Select
          value={data.usage_intensity || ""}
          onValueChange={(value) => updateField("usage_intensity", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="occasionnel">Occasionnel</SelectItem>
            <SelectItem value="régulier">Régulier</SelectItem>
            <SelectItem value="intensif">Intensif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Niveau de compétence utilisateurs</Label>
        <Select
          value={data.user_skill_level || ""}
          onValueChange={(value) => updateField("user_skill_level", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="débutant">Débutant</SelectItem>
            <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Plateforme unique</Label>
        <Select
          value={data.platform_type || ""}
          onValueChange={(value) => updateField("platform_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Teams">Microsoft Teams</SelectItem>
            <SelectItem value="Zoom">Zoom</SelectItem>
            <SelectItem value="Meet">Google Meet</SelectItem>
            <SelectItem value="BYOD">BYOD (Bring Your Own Device)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre-personnes">Nombre de personnes</Label>
        <Input
          id="nombre-personnes"
          type="number"
          min="0"
          placeholder="Ex: 12"
          value={data.nombre_personnes || ""}
          onChange={(e) => updateField("nombre_personnes", parseInt(e.target.value) || undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label>Réservation de salle</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reservation"
            checked={data.reservation_salle || false}
            onCheckedChange={(checked) => updateField("reservation_salle", checked)}
          />
          <label htmlFor="reservation" className="text-sm cursor-pointer">
            Système de réservation requis
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Automatisation</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="booking"
              checked={data.automation_booking || false}
              onCheckedChange={(checked) =>
                updateField("automation_booking", checked)
              }
            />
            <label htmlFor="booking" className="text-sm cursor-pointer">
              Réservation automatique
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lighting"
              checked={data.automation_lighting || false}
              onCheckedChange={(checked) =>
                updateField("automation_lighting", checked)
              }
            />
            <label htmlFor="lighting" className="text-sm cursor-pointer">
              Gestion automatique de l'éclairage
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acoustic"
              checked={data.automation_acoustic || false}
              onCheckedChange={(checked) =>
                updateField("automation_acoustic", checked)
              }
            />
            <label htmlFor="acoustic" className="text-sm cursor-pointer">
              Traitement acoustique automatique
            </label>
          </div>
        </div>
      </div>

      {/* Dépose et rapatriement */}
      <div className="space-y-3">
        <Label>Matériel existant</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="depose_materiel"
              checked={data.depose_materiel || false}
              onCheckedChange={(checked) =>
                updateField("depose_materiel", checked)
              }
            />
            <label htmlFor="depose_materiel" className="text-sm cursor-pointer">
              Dépose de matériel existant demandée
            </label>
          </div>
          {data.depose_materiel && (
            <div className="flex items-center space-x-2 ml-6">
              <Checkbox
                id="rapatriement_materiel"
                checked={data.rapatriement_materiel || false}
                onCheckedChange={(checked) =>
                  updateField("rapatriement_materiel", checked)
                }
              />
              <label htmlFor="rapatriement_materiel" className="text-sm cursor-pointer">
                Rapatriement du matériel demandé
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Formation */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="formation_demandee"
            checked={data.formation_demandee || false}
            onCheckedChange={(checked) =>
              updateField("formation_demandee", checked)
            }
          />
          <label htmlFor="formation_demandee" className="text-sm cursor-pointer">
            Formation demandée
          </label>
        </div>
      </div>
    </div>
  );
};
