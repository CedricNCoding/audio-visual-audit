import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Bug, Copy, X } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AILink {
  id: string;
  from: string;
  to: string;
  signal_type: string;
  transport: string;
  comment: string;
}

interface AIAudioConfig {
  type_sonorisation: string;
  ambiance: { active: boolean; description: string };
  puissance: { active: boolean; niveau: string; description: string };
  diffusion: {
    homogene: boolean;
    mode: string[];
    approx_nb_enceintes: number;
    zones: string[];
  };
  traitement: { dsp_recommande: boolean; dante_recommande: boolean };
}

interface AIUserConnectivity {
  table: {
    hdmi: number;
    usbc: number;
    rj45: number;
    comments: string;
  };
}

interface AIAnalysisData {
  links: AILink[];
  audio_links: AILink[];
  audio_config: AIAudioConfig;
  user_connectivity: AIUserConnectivity;
  warnings: string[];
  critical_errors: string[];
  debug: string[];
  summary_text: string;
}

interface AIAnalysisResultsProps {
  data: AIAnalysisData;
  onApply: (selections: {
    selectedLinks: string[];
    selectedAudioLinks: string[];
    applyAudioConfig: boolean;
    applyConnectivity: boolean;
  }) => void;
  onClose: () => void;
}

export const AIAnalysisResults = ({
  data,
  onApply,
  onClose,
}: AIAnalysisResultsProps) => {
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [selectedAudioLinks, setSelectedAudioLinks] = useState<Set<string>>(
    new Set()
  );
  const [applyAudioConfig, setApplyAudioConfig] = useState(false);
  const [applyConnectivity, setApplyConnectivity] = useState(false);

  const toggleLink = (id: string) => {
    const newSet = new Set(selectedLinks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLinks(newSet);
  };

  const toggleAudioLink = (id: string) => {
    const newSet = new Set(selectedAudioLinks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAudioLinks(newSet);
  };

  const handleApply = () => {
    onApply({
      selectedLinks: Array.from(selectedLinks),
      selectedAudioLinks: Array.from(selectedAudioLinks),
      applyAudioConfig,
      applyConnectivity,
    });
  };

  const copyText = () => {
    navigator.clipboard.writeText(data.summary_text);
    toast.success("Texte IA copié dans le presse-papier");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container max-w-6xl mx-auto p-6">
        <Card className="glass neon-border-yellow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="neon-yellow text-2xl">
              Résultats de l'analyse IA
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Critical Errors */}
            {data.critical_errors && data.critical_errors.length > 0 && (
              <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Erreurs critiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {data.critical_errors.map((error, i) => (
                      <li key={i} className="text-destructive">
                        {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {data.warnings && data.warnings.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    Avertissements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {data.warnings.map((warning, i) => (
                      <li key={i} className="text-yellow-500">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Video/USB/Network Links */}
            {data.links && data.links.length > 0 && (
              <Card className="glass neon-border-blue">
                <CardHeader>
                  <CardTitle className="neon-blue">
                    Liaisons vidéo/USB/réseau recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <Checkbox
                        checked={selectedLinks.has(link.id)}
                        onCheckedChange={() => toggleLink(link.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">
                          {link.from} → {link.to}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Signal: {link.signal_type} | Transport: {link.transport}
                        </div>
                        <div className="text-sm italic">{link.comment}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Audio Links */}
            {data.audio_links && data.audio_links.length > 0 && (
              <Card className="glass neon-border-blue">
                <CardHeader>
                  <CardTitle className="neon-blue">Liaisons audio recommandées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.audio_links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <Checkbox
                        checked={selectedAudioLinks.has(link.id)}
                        onCheckedChange={() => toggleAudioLink(link.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">
                          {link.from} → {link.to}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Signal: {link.signal_type} | Transport: {link.transport}
                        </div>
                        <div className="text-sm italic">{link.comment}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Audio Config */}
            {data.audio_config && (
              <Card className="glass neon-border-blue">
                <CardHeader>
                  <CardTitle className="neon-blue">Configuration audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-lg">
                      Type: {data.audio_config.type_sonorisation}
                    </Label>
                    {data.audio_config.ambiance?.active && (
                      <div>
                        <strong>Ambiance:</strong>{" "}
                        {data.audio_config.ambiance.description}
                      </div>
                    )}
                    {data.audio_config.puissance?.active && (
                      <div>
                        <strong>Puissance:</strong>{" "}
                        {data.audio_config.puissance.niveau} -{" "}
                        {data.audio_config.puissance.description}
                      </div>
                    )}
                    {data.audio_config.diffusion?.homogene && (
                      <div>
                        <strong>Diffusion:</strong>{" "}
                        {data.audio_config.diffusion.mode?.join(", ") || "N/A"} (
                        {data.audio_config.diffusion.approx_nb_enceintes || 0}{" "}
                        enceintes approx.)
                      </div>
                    )}
                    <div>
                      <strong>Traitement:</strong> DSP{" "}
                      {data.audio_config.traitement?.dsp_recommande
                        ? "recommandé"
                        : "non nécessaire"}
                      , Dante{" "}
                      {data.audio_config.traitement?.dante_recommande
                        ? "recommandé"
                        : "non nécessaire"}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply-audio"
                      checked={applyAudioConfig}
                      onCheckedChange={(checked) =>
                        setApplyAudioConfig(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="apply-audio"
                      className="text-sm cursor-pointer font-medium"
                    >
                      Appliquer cette configuration audio IA
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Connectivity */}
            {data.user_connectivity && (
              <Card className="glass neon-border-blue">
                <CardHeader>
                  <CardTitle className="neon-blue">
                    Connectique utilisateur recommandée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div>
                      <strong>Table:</strong> {data.user_connectivity?.table?.hdmi || 0}{" "}
                      HDMI, {data.user_connectivity?.table?.usbc || 0} USB-C,{" "}
                      {data.user_connectivity?.table?.rj45 || 0} RJ45
                    </div>
                    {data.user_connectivity?.table?.comments && (
                      <div className="text-sm italic">
                        {data.user_connectivity.table.comments}
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply-connectivity"
                      checked={applyConnectivity}
                      onCheckedChange={(checked) =>
                        setApplyConnectivity(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="apply-connectivity"
                      className="text-sm cursor-pointer font-medium"
                    >
                      Appliquer la connectique utilisateur IA
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Debug */}
            {data.debug && data.debug.length > 0 && (
              <Collapsible>
                <Card className="glass">
                  <CardHeader>
                    <CollapsibleTrigger className="w-full">
                      <CardTitle className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Bug className="h-5 w-5" />
                          Mode debug
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Cliquer pour afficher
                        </span>
                      </CardTitle>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {data.debug.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Summary Text */}
            {data.summary_text && (
              <Card className="glass neon-border-yellow">
                <CardHeader>
                  <CardTitle className="neon-yellow">Texte IA pour devis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full h-96 p-4 bg-background/50 border border-border rounded-lg text-sm font-mono"
                    value={data.summary_text}
                    readOnly
                  />
                  <Button onClick={copyText} variant="secondary">
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le texte IA
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Fermer sans appliquer
              </Button>
              <Button onClick={handleApply} className="neon-border-blue">
                Appliquer les éléments sélectionnés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};