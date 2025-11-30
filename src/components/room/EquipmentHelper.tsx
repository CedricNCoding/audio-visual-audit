import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Volume2, Video, Network } from "lucide-react";

interface EquipmentHelperProps {
  typology?: string;
}

export const EquipmentHelper = ({ typology }: EquipmentHelperProps) => {
  const isHuddle = typology?.toLowerCase().includes("huddle");
  const isAuditorium = typology?.toLowerCase().includes("auditorium");
  const isFormation = typology?.toLowerCase().includes("formation");

  return (
    <Card className="glass neon-border-yellow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Aide au choix / Suggestions d'équipements
        </CardTitle>
        <CardDescription>
          Suggestions adaptées à votre typologie de salle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="displays" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="displays">Diffuseurs</TabsTrigger>
            <TabsTrigger value="audio">Sonorisation</TabsTrigger>
            <TabsTrigger value="visio">Visio</TabsTrigger>
            <TabsTrigger value="network">Réseau</TabsTrigger>
          </TabsList>

          <TabsContent value="displays" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Moniteurs standards</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 55" - Petite salle (huddle, 4-6 pers)</li>
                <li>• 65" - Salle réunion standard (6-10 pers)</li>
                <li>• 75" - Grande salle réunion (10-15 pers)</li>
                <li>• 86" - Salle direction/conseil (15-20 pers)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Vidéoprojecteurs</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 3000-4000 lumens : écran 80-100"</li>
                <li>• 4000-5000 lumens : écran 100-120"</li>
                <li>• 5000+ lumens : écran 120-150" ou plus</li>
              </ul>
            </div>
            {isAuditorium && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">LED Wall</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Pitch 1.5-2mm : vision rapprochée</li>
                  <li>• Pitch 2-3mm : usage standard</li>
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audio" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Diffusion sonore</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Ambiance : 2 enceintes plafond</li>
                <li>• Homogène : 4-6 enceintes plafond</li>
                <li>• Renforcement : système line array ou colonne</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Microphones</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• HF main : intervention ponctuelle</li>
                <li>• HF serre-tête : formation, déplacement</li>
                <li>• Pupitre : conférencier statique</li>
                <li>• Plafond beamforming : capture automatique</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Traitement</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• DSP recommandé si &gt; 2 micros ou renforcement</li>
                <li>• Anti-larsen si acoustique difficile</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="visio" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Solutions visio</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                {isHuddle ? (
                  <li>• Barre de visio tout-en-un (Poly Studio, Logitech Rally Bar)</li>
                ) : (
                  <>
                    <li>• Barre de visio : huddle, petite salle</li>
                    <li>• PTZ unique : salle réunion standard</li>
                    <li>• PTZ double : grande salle, tracking automatique</li>
                  </>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Modes de fonctionnement</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• BYOD : connexion PC personnel (USB-C, HDMI)</li>
                <li>• Room System : système dédié (Cisco, Poly, Yealink)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Prises réseau RJ45</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Table : BYOD, PC fixe</li>
                <li>• Rack : codec visio, player, équipements réseau</li>
                <li>• Switch PoE si caméras PTZ ou Dante</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recommandations générales</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 1 RJ45 par codec/NUC visio</li>
                <li>• 1 RJ45 si streaming</li>
                <li>• 1 RJ45 si Dante audio</li>
                <li>• 1-2 RJ45 table si BYOD</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {!typology && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
            <p className="text-sm text-yellow-500">
              ℹ️ Définissez la typologie de la salle pour des suggestions plus précises.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
