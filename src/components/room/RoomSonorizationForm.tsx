import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface RoomSonorizationData {
  // Nouveaux champs V2.1
  type_sonorisation?: string;
  diffusion_homogene?: boolean;
  diffusion_orientee?: boolean;
  diffusion_locale?: boolean;
  renforcement_voix?: boolean;
  nb_micro_main_hf?: number;
  nb_micro_cravate_hf?: number;
  nb_micro_serre_tete_hf?: number;
  nb_micro_pupitre?: number;
  nb_micro_plafond_beamforming?: number;
  nb_micro_table?: number;
  mixage_multiple?: boolean;
  retour_necessaire?: boolean;
  retour_type?: string;
  acoustique_niveau?: string;
  sources_audio_specifiques?: string;
  dsp_necessaire?: boolean;
  dante_souhaite?: boolean;
  anti_larsen?: boolean;
}

interface RoomSonorizationFormProps {
  data: RoomSonorizationData;
  onChange: (data: RoomSonorizationData) => void;
}

export const RoomSonorizationForm = ({ data, onChange }: RoomSonorizationFormProps) => {
  const updateField = (field: keyof RoomSonorizationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Type général de sonorisation */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Type de sonorisation</h3>
        <div className="space-y-2">
          <Label>Type général</Label>
          <Select
            value={data.type_sonorisation || ""}
            onValueChange={(value) => updateField("type_sonorisation", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ambiance">Ambiance</SelectItem>
              <SelectItem value="Conférence / Formation">Conférence / Formation</SelectItem>
              <SelectItem value="Mixte (ambiance + voix)">Mixte (ambiance + voix)</SelectItem>
              <SelectItem value="Aucune sonorisation">Aucune sonorisation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SECTION 2 — Diffusion */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Diffusion</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diffusion_homogene"
              checked={data.diffusion_homogene || false}
              onCheckedChange={(checked) => updateField("diffusion_homogene", checked)}
            />
            <label htmlFor="diffusion_homogene" className="text-sm cursor-pointer">
              Diffusion homogène dans toute la pièce
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diffusion_orientee"
              checked={data.diffusion_orientee || false}
              onCheckedChange={(checked) => updateField("diffusion_orientee", checked)}
            />
            <label htmlFor="diffusion_orientee" className="text-sm cursor-pointer">
              Diffusion orientée vers le public
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diffusion_locale"
              checked={data.diffusion_locale || false}
              onCheckedChange={(checked) => updateField("diffusion_locale", checked)}
            />
            <label htmlFor="diffusion_locale" className="text-sm cursor-pointer">
              Diffusion locale (pupitre, table…)
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Renforcement voix */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Renforcement voix</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="renforcement_voix"
            checked={data.renforcement_voix || false}
            onCheckedChange={(checked) => updateField("renforcement_voix", checked)}
          />
          <label htmlFor="renforcement_voix" className="text-sm cursor-pointer">
            Renforcement de la voix nécessaire
          </label>
        </div>

        {data.renforcement_voix && (
          <div className="space-y-4 ml-6">
            <div className="space-y-3">
              <Label className="text-base">Quantité par type de micro</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Micro main HF</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_main_hf || 0}
                    onChange={(e) => updateField("nb_micro_main_hf", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Micro cravate HF</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_cravate_hf || 0}
                    onChange={(e) => updateField("nb_micro_cravate_hf", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Micro serre-tête HF</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_serre_tete_hf || 0}
                    onChange={(e) => updateField("nb_micro_serre_tete_hf", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Micro pupitre filaire</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_pupitre || 0}
                    onChange={(e) => updateField("nb_micro_pupitre", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Micro plafond beamforming</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_plafond_beamforming || 0}
                    onChange={(e) => updateField("nb_micro_plafond_beamforming", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Micro de table</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nb_micro_table || 0}
                    onChange={(e) => updateField("nb_micro_table", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mixage_multiple"
                checked={data.mixage_multiple || false}
                onCheckedChange={(checked) => updateField("mixage_multiple", checked)}
              />
              <label htmlFor="mixage_multiple" className="text-sm cursor-pointer">
                Plusieurs micros utilisés simultanément (mixage multiple)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4 — Retour sonore */}
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
                <SelectItem value="Oreillette / in-ear">Oreillette / in-ear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* SECTION 5 — Acoustique */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Acoustique</h3>
        <div className="space-y-2">
          <Label>Niveau acoustique de la salle</Label>
          <Select
            value={data.acoustique_niveau || ""}
            onValueChange={(value) => updateField("acoustique_niveau", value)}
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

      {/* SECTION 6 — Sources audio spécifiques */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Sources audio spécifiques</h3>
        <div className="space-y-2">
          <Label>Description des sources audio spécifiques à intégrer</Label>
          <Textarea
            value={data.sources_audio_specifiques || ""}
            onChange={(e) => updateField("sources_audio_specifiques", e.target.value)}
            placeholder="Ex: lecteur CD, platines vinyles, entrée auxiliaire..."
            rows={4}
          />
        </div>
      </div>

      {/* SECTION 7 — Traitement audio */}
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Traitement audio</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>DSP nécessaire ?</Label>
            <Select
              value={data.dsp_necessaire === true ? "Oui" : data.dsp_necessaire === false ? "Non" : ""}
              onValueChange={(value) => updateField("dsp_necessaire", value === "Oui" ? true : value === "Non" ? false : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oui">Oui</SelectItem>
                <SelectItem value="Non">Non</SelectItem>
                <SelectItem value="Je ne sais pas">Je ne sais pas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dante souhaité ?</Label>
            <Select
              value={data.dante_souhaite === true ? "Oui" : data.dante_souhaite === false ? "Non" : ""}
              onValueChange={(value) => updateField("dante_souhaite", value === "Oui" ? true : value === "Non" ? false : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oui">Oui</SelectItem>
                <SelectItem value="Non">Non</SelectItem>
                <SelectItem value="Peu importe">Peu importe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anti_larsen"
              checked={data.anti_larsen || false}
              onCheckedChange={(checked) => updateField("anti_larsen", checked)}
            />
            <label htmlFor="anti_larsen" className="text-sm cursor-pointer">
              Système anti-larsen requis
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};