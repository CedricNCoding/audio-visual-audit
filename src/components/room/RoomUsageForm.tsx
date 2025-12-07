import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Panel, InputField } from "@/components/design-system";

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Usage Principal */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '0ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Usage principal
          </h3>
          <InputField
            label="Description de l'usage"
            value={data.main_usage || ""}
            onChange={(e) => updateField("main_usage", e.target.value)}
            placeholder="Ex: Réunions d'équipe, formations..."
            focusGlow="yellow"
          />
        </div>
      </Panel>

      {/* Section Profil d'utilisation */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '40ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Profil d'utilisation
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Intensité d'usage</Label>
              <Select
                value={data.usage_intensity || ""}
                onValueChange={(value) => updateField("usage_intensity", value)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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
              <Label className="text-sm text-muted-foreground">Niveau de compétence</Label>
              <Select
                value={data.user_skill_level || ""}
                onValueChange={(value) => updateField("user_skill_level", value)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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
              <Label className="text-sm text-muted-foreground">Plateforme unique</Label>
              <Select
                value={data.platform_type || ""}
                onValueChange={(value) => updateField("platform_type", value)}
              >
                <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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

            <InputField
              label="Nombre de personnes"
              type="number"
              min={0}
              placeholder="Ex: 12"
              value={data.nombre_personnes || ""}
              onChange={(e) => updateField("nombre_personnes", parseInt(e.target.value) || undefined)}
              focusGlow="cyan"
            />
          </div>
        </div>
      </Panel>

      {/* Section Réservation */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '80ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Réservation
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="reservation"
              checked={data.reservation_salle || false}
              onCheckedChange={(checked) => updateField("reservation_salle", checked)}
              className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
            />
            <label htmlFor="reservation" className="text-sm cursor-pointer text-foreground">
              Système de réservation requis
            </label>
          </div>
        </div>
      </Panel>

      {/* Section Automatisation */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '120ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Automatisation
          </h3>
          <div className="space-y-3">
            {[
              { id: "booking", field: "automation_booking" as const, label: "Réservation automatique" },
              { id: "lighting", field: "automation_lighting" as const, label: "Gestion automatique de l'éclairage" },
              { id: "acoustic", field: "automation_acoustic" as const, label: "Traitement acoustique automatique" },
            ].map((item, index) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all"
                style={{ animationDelay: `${index * 30}ms` }}
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

      {/* Section Matériel existant */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '160ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
            Matériel existant
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
              <Checkbox
                id="depose_materiel"
                checked={data.depose_materiel || false}
                onCheckedChange={(checked) => updateField("depose_materiel", checked)}
                className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
              />
              <label htmlFor="depose_materiel" className="text-sm cursor-pointer text-foreground">
                Dépose de matériel existant demandée
              </label>
            </div>
            {data.depose_materiel && (
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all ml-6 animate-fade-in">
                <Checkbox
                  id="rapatriement_materiel"
                  checked={data.rapatriement_materiel || false}
                  onCheckedChange={(checked) => updateField("rapatriement_materiel", checked)}
                  className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                />
                <label htmlFor="rapatriement_materiel" className="text-sm cursor-pointer text-foreground">
                  Rapatriement du matériel demandé
                </label>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Section Formation */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '200ms' }}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
            Formation
          </h3>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="formation_demandee"
              checked={data.formation_demandee || false}
              onCheckedChange={(checked) => updateField("formation_demandee", checked)}
              className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <label htmlFor="formation_demandee" className="text-sm cursor-pointer text-foreground">
              Formation demandée
            </label>
          </div>
        </div>
      </Panel>
    </div>
  );
};
