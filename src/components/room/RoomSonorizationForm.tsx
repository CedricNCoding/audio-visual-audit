import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Panel, InputField } from "@/components/design-system";

interface RoomSonorizationData {
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
    <div className="space-y-6 animate-fade-in-up">
      {/* SECTION 1 — Type général de sonorisation */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '0ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Type de sonorisation
          </h3>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Type général</Label>
            <Select
              value={data.type_sonorisation || ""}
              onValueChange={(value) => updateField("type_sonorisation", value)}
            >
              <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-yellow/50 focus:shadow-glow-yellow transition-all">
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
      </Panel>

      {/* SECTION 2 — Diffusion */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '40ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Diffusion
          </h3>
          <div className="space-y-3">
            {[
              { id: "diffusion_homogene", field: "diffusion_homogene" as const, label: "Diffusion homogène dans toute la pièce" },
              { id: "diffusion_orientee", field: "diffusion_orientee" as const, label: "Diffusion orientée vers le public" },
              { id: "diffusion_locale", field: "diffusion_locale" as const, label: "Diffusion locale (pupitre, table…)" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all"
              >
                <Checkbox
                  id={item.id}
                  checked={data[item.field] || false}
                  onCheckedChange={(checked) => updateField(item.field, checked)}
                  className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                />
                <label htmlFor={item.id} className="text-sm cursor-pointer text-foreground">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* SECTION 3 — Renforcement voix */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '80ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Renforcement voix
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="renforcement_voix"
              checked={data.renforcement_voix || false}
              onCheckedChange={(checked) => updateField("renforcement_voix", checked)}
              className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
            />
            <label htmlFor="renforcement_voix" className="text-sm cursor-pointer text-foreground">
              Renforcement de la voix nécessaire
            </label>
          </div>

          {data.renforcement_voix && (
            <div className="space-y-4 ml-4 pt-2 animate-fade-in">
              <Label className="text-base text-foreground">Quantité par type de micro</Label>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Micro main HF"
                  type="number"
                  min={0}
                  value={data.nb_micro_main_hf || 0}
                  onChange={(e) => updateField("nb_micro_main_hf", parseInt(e.target.value) || 0)}
                  focusGlow="yellow"
                />
                <InputField
                  label="Micro cravate HF"
                  type="number"
                  min={0}
                  value={data.nb_micro_cravate_hf || 0}
                  onChange={(e) => updateField("nb_micro_cravate_hf", parseInt(e.target.value) || 0)}
                  focusGlow="yellow"
                />
                <InputField
                  label="Micro serre-tête HF"
                  type="number"
                  min={0}
                  value={data.nb_micro_serre_tete_hf || 0}
                  onChange={(e) => updateField("nb_micro_serre_tete_hf", parseInt(e.target.value) || 0)}
                  focusGlow="yellow"
                />
                <InputField
                  label="Micro pupitre filaire"
                  type="number"
                  min={0}
                  value={data.nb_micro_pupitre || 0}
                  onChange={(e) => updateField("nb_micro_pupitre", parseInt(e.target.value) || 0)}
                  focusGlow="cyan"
                />
                <InputField
                  label="Micro plafond beamforming"
                  type="number"
                  min={0}
                  value={data.nb_micro_plafond_beamforming || 0}
                  onChange={(e) => updateField("nb_micro_plafond_beamforming", parseInt(e.target.value) || 0)}
                  focusGlow="cyan"
                />
                <InputField
                  label="Micro de table"
                  type="number"
                  min={0}
                  value={data.nb_micro_table || 0}
                  onChange={(e) => updateField("nb_micro_table", parseInt(e.target.value) || 0)}
                  focusGlow="cyan"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
                <Checkbox
                  id="mixage_multiple"
                  checked={data.mixage_multiple || false}
                  onCheckedChange={(checked) => updateField("mixage_multiple", checked)}
                  className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                />
                <label htmlFor="mixage_multiple" className="text-sm cursor-pointer text-foreground">
                  Plusieurs micros utilisés simultanément (mixage multiple)
                </label>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* SECTION 4 — Retour sonore */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '120ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Retour sonore
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="retour_necessaire"
              checked={data.retour_necessaire || false}
              onCheckedChange={(checked) => updateField("retour_necessaire", checked)}
              className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <label htmlFor="retour_necessaire" className="text-sm cursor-pointer text-foreground">
              Retour sonore nécessaire
            </label>
          </div>
          {data.retour_necessaire && (
            <div className="space-y-2 ml-4 animate-fade-in">
              <Label className="text-sm text-muted-foreground">Type de retour</Label>
              <Select
                value={data.retour_type || ""}
                onValueChange={(value) => updateField("retour_type", value)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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
      </Panel>

      {/* SECTION 5 — Acoustique */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '160ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Acoustique
          </h3>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Niveau acoustique de la salle</Label>
            <Select
              value={data.acoustique_niveau || ""}
              onValueChange={(value) => updateField("acoustique_niveau", value)}
            >
              <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-yellow/50 focus:shadow-glow-yellow transition-all">
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
      </Panel>

      {/* SECTION 6 — Sources audio spécifiques */}
      <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '200ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Sources audio spécifiques
          </h3>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Description des sources audio</Label>
            <Textarea
              value={data.sources_audio_specifiques || ""}
              onChange={(e) => updateField("sources_audio_specifiques", e.target.value)}
              placeholder="Ex: lecteur CD, platines vinyles, entrée auxiliaire..."
              rows={4}
              className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all resize-none"
            />
          </div>
        </div>
      </Panel>

      {/* SECTION 7 — Traitement audio */}
      <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '240ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Traitement audio
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">DSP nécessaire ?</Label>
              <Select
                value={data.dsp_necessaire === true ? "Oui" : data.dsp_necessaire === false ? "Non" : ""}
                onValueChange={(value) => updateField("dsp_necessaire", value === "Oui" ? true : value === "Non" ? false : null)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-yellow/50 focus:shadow-glow-yellow transition-all">
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
              <Label className="text-sm text-muted-foreground">Dante souhaité ?</Label>
              <Select
                value={data.dante_souhaite === true ? "Oui" : data.dante_souhaite === false ? "Non" : ""}
                onValueChange={(value) => updateField("dante_souhaite", value === "Oui" ? true : value === "Non" ? false : null)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                  <SelectItem value="Peu importe">Peu importe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="anti_larsen"
              checked={data.anti_larsen || false}
              onCheckedChange={(checked) => updateField("anti_larsen", checked)}
              className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
            />
            <label htmlFor="anti_larsen" className="text-sm cursor-pointer text-foreground">
              Système anti-larsen requis
            </label>
          </div>
        </div>
      </Panel>
    </div>
  );
};
