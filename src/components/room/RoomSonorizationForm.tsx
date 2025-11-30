import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface RoomSonorizationData {
  ambiance_necessaire?: boolean;
  ambiance_type?: string;
  puissance_necessaire?: boolean;
  puissance_niveau?: string;
  diffusion_homogene?: boolean;
  type_diffusion?: string[];
  renforcement_voix?: boolean;
  nb_micros_renfort?: number;
  types_micros_renfort?: string[];
  mixage_multiple?: boolean;
  objectif_acoustique?: string;
  retour_necessaire?: boolean;
  retour_type?: string;
  larsen_risque?: boolean;
  sources_audio_specifiques?: string;
  dsp_necessaire?: boolean;
  dante_souhaite?: boolean;
}

interface RoomSonorizationFormProps {
  data: RoomSonorizationData;
  onChange: (data: RoomSonorizationData) => void;
}

export const RoomSonorizationForm = ({ data, onChange }: RoomSonorizationFormProps) => {
  const updateField = (field: keyof RoomSonorizationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleArrayValue = (field: 'type_diffusion' | 'types_micros_renfort', value: string) => {
    const currentArray = data[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateField(field, newArray);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1 — Sonorisation d'ambiance */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Sonorisation d'ambiance</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ambiance_necessaire"
            checked={data.ambiance_necessaire || false}
            onCheckedChange={(checked) => updateField("ambiance_necessaire", checked)}
          />
          <label htmlFor="ambiance_necessaire" className="text-sm cursor-pointer">
            Sonorisation d'ambiance nécessaire
          </label>
        </div>
        {data.ambiance_necessaire && (
          <div className="space-y-2 ml-6">
            <Label>Type d'ambiance</Label>
            <Select
              value={data.ambiance_type || ""}
              onValueChange={(value) => updateField("ambiance_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Musique légère">Musique légère</SelectItem>
                <SelectItem value="Ambiance vidéo">Ambiance vidéo</SelectItem>
                <SelectItem value="Messages vocaux">Messages vocaux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* SECTION 2 — Sonorisation de puissance */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Sonorisation de puissance</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="puissance_necessaire"
            checked={data.puissance_necessaire || false}
            onCheckedChange={(checked) => updateField("puissance_necessaire", checked)}
          />
          <label htmlFor="puissance_necessaire" className="text-sm cursor-pointer">
            Sonorisation de puissance nécessaire
          </label>
        </div>
        {data.puissance_necessaire && (
          <div className="space-y-2 ml-6">
            <Label>Niveau de puissance</Label>
            <Select
              value={data.puissance_niveau || ""}
              onValueChange={(value) => updateField("puissance_niveau", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petit groupe (−20 pers)">Petit groupe (−20 pers)</SelectItem>
                <SelectItem value="Moyen (20–50)">Moyen (20–50)</SelectItem>
                <SelectItem value="Grand (50+)">Grand (50+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* SECTION 3 — Diffusion homogène */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Diffusion homogène</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="diffusion_homogene"
            checked={data.diffusion_homogene || false}
            onCheckedChange={(checked) => updateField("diffusion_homogene", checked)}
          />
          <label htmlFor="diffusion_homogene" className="text-sm cursor-pointer">
            Diffusion homogène requise
          </label>
        </div>
        {data.diffusion_homogene && (
          <div className="space-y-2 ml-6">
            <Label>Types de diffusion (multi-choix)</Label>
            <div className="space-y-2">
              {["Plafond", "Murs", "Totems", "Encastré"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diffusion_${type}`}
                    checked={(data.type_diffusion || []).includes(type)}
                    onCheckedChange={() => toggleArrayValue("type_diffusion", type)}
                  />
                  <label htmlFor={`diffusion_${type}`} className="text-sm cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4 — Renforcement voix */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Renforcement voix</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="renforcement_voix"
            checked={data.renforcement_voix || false}
            onCheckedChange={(checked) => updateField("renforcement_voix", checked)}
          />
          <label htmlFor="renforcement_voix" className="text-sm cursor-pointer">
            Renforcement voix nécessaire
          </label>
        </div>
        {data.renforcement_voix && (
          <div className="space-y-4 ml-6">
            <div className="space-y-2">
              <Label>Nombre de micros de renfort</Label>
              <Input
                type="number"
                min="0"
                value={data.nb_micros_renfort || 0}
                onChange={(e) => updateField("nb_micros_renfort", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Types de micros (multi-choix)</Label>
              <div className="space-y-2">
                {["Main HF", "Cravate HF", "Serre-tête HF", "Micro pupitre", "Micro plafond Beamforming"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`micro_${type}`}
                      checked={(data.types_micros_renfort || []).includes(type)}
                      onCheckedChange={() => toggleArrayValue("types_micros_renfort", type)}
                    />
                    <label htmlFor={`micro_${type}`} className="text-sm cursor-pointer">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mixage_multiple"
                checked={data.mixage_multiple || false}
                onCheckedChange={(checked) => updateField("mixage_multiple", checked)}
              />
              <label htmlFor="mixage_multiple" className="text-sm cursor-pointer">
                Mixage multiple
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5 — Acoustique */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Acoustique</h3>
        <div className="space-y-2">
          <Label>Objectif acoustique</Label>
          <Select
            value={data.objectif_acoustique || ""}
            onValueChange={(value) => updateField("objectif_acoustique", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Acceptable">Acceptable</SelectItem>
              <SelectItem value="Problématique">Problématique</SelectItem>
              <SelectItem value="Très réverbérée">Très réverbérée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SECTION 6 — Retour sonore */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Retour sonore</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="retour_necessaire"
            checked={data.retour_necessaire || false}
            onCheckedChange={(checked) => updateField("retour_necessaire", checked)}
          />
          <label htmlFor="retour_necessaire" className="text-sm cursor-pointer">
            Retour sonore nécessaire
          </label>
        </div>
        {data.retour_necessaire && (
          <div className="space-y-2 ml-6">
            <Label>Type de retour</Label>
            <Select
              value={data.retour_type || ""}
              onValueChange={(value) => updateField("retour_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pupitre">Pupitre</SelectItem>
                <SelectItem value="Scène">Scène</SelectItem>
                <SelectItem value="Oreillette">Oreillette</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* SECTION 7 — Risque de larsen */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Risque de larsen</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="larsen_risque"
            checked={data.larsen_risque || false}
            onCheckedChange={(checked) => updateField("larsen_risque", checked)}
          />
          <label htmlFor="larsen_risque" className="text-sm cursor-pointer">
            Risque de larsen identifié
          </label>
        </div>
      </div>

      {/* SECTION 8 — Sources audio spécifiques */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Sources audio spécifiques</h3>
        <div className="space-y-2">
          <Label>Description des sources audio spécifiques</Label>
          <Textarea
            value={data.sources_audio_specifiques || ""}
            onChange={(e) => updateField("sources_audio_specifiques", e.target.value)}
            placeholder="Décrivez les sources audio spécifiques à prendre en compte..."
            rows={4}
          />
        </div>
      </div>

      {/* SECTION 9 — Traitement audio */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Traitement audio</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dsp_necessaire"
              checked={data.dsp_necessaire || false}
              onCheckedChange={(checked) => updateField("dsp_necessaire", checked)}
            />
            <label htmlFor="dsp_necessaire" className="text-sm cursor-pointer">
              DSP nécessaire
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dante_souhaite"
              checked={data.dante_souhaite || false}
              onCheckedChange={(checked) => updateField("dante_souhaite", checked)}
            />
            <label htmlFor="dante_souhaite" className="text-sm cursor-pointer">
              Dante souhaité
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};