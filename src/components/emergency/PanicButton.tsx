import { useState, useRef } from "react";
import { AlertTriangle, Shield, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PanicButton = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Update the panic alert with actual audio data
        const alerts = JSON.parse(localStorage.getItem('panic_alerts') || '[]');
        const updatedAlerts = alerts.map((alert: any) => 
          alert.id === Date.now().toString() ? { ...alert, audio_blob: audioBlob, audio_url: audioUrl } : alert
        );
        localStorage.setItem('panic_alerts', JSON.stringify(updatedAlerts));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      toast({
        title: "Erro na Gravação",
        description: "Não foi possível iniciar a gravação de áudio.",
        variant: "destructive",
      });
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handlePanicActivation = async () => {
    if (!isActivated) {
      setIsActivated(true);
      
      // Save panic alert to localStorage
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      const alertId = Date.now().toString();
      const panicAlert = {
        id: alertId,
        citizen_id: currentUser.id,
        citizen_name: currentUser.full_name,
        location: "Localização obtida via GPS", // In real app would use geolocation
        latitude: -15.7942,
        longitude: -47.8822,
        audio_url: `panic-audio-${alertId}.wav`,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      
      const existingAlerts = JSON.parse(localStorage.getItem('panic_alerts') || '[]');
      existingAlerts.push(panicAlert);
      localStorage.setItem('panic_alerts', JSON.stringify(existingAlerts));
      
      // Start audio recording
      await startAudioRecording();
      
      toast({
        title: "Botão de Pânico Ativado",
        description: "Gravação de áudio iniciada. Agentes foram notificados.",
        variant: "destructive",
      });
      
      // Simular chegada do agente após 30 segundos
      setTimeout(() => {
        setIsActivated(false);
        stopAudioRecording();
        toast({
          title: "Agente Chegou ao Local",
          description: "Gravação finalizada. Situação sendo avaliada.",
        });
      }, 30000);
    }
  };

  return (
    <Card className="border-emergency/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emergency">
          <Shield className="h-5 w-5" />
          Botão de Pânico
        </CardTitle>
        <CardDescription>
          Disponível apenas para pessoas com medidas protetivas ativas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className={`
              w-32 h-32 rounded-full text-white border-2 transition-all duration-300
              ${isActivated 
                ? 'bg-emergency border-emergency animate-pulse-emergency shadow-emergency' 
                : 'bg-emergency/80 border-emergency hover:bg-emergency hover:shadow-emergency'
              }
            `}
            onClick={handlePanicActivation}
            disabled={isActivated}
          >
            <div className="flex flex-col items-center space-y-2">
              <AlertTriangle className="h-8 w-8" />
              <span className="text-sm font-bold">
                {isActivated ? 'ATIVADO' : 'PÂNICO'}
              </span>
            </div>
          </Button>
        </div>
        
        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-emergency">
              <Mic className="w-4 h-4 animate-pulse" />
              <div className="w-3 h-3 bg-emergency rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Gravando áudio ambiente...</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agente mais próximo foi notificado e está a caminho
            </p>
            <div className="mt-2 flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={stopAudioRecording}
                className="text-emergency border-emergency"
              >
                <MicOff className="w-3 h-3 mr-1" />
                Parar Gravação
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          Use apenas em situações de emergência real
        </div>
      </CardContent>
    </Card>
  );
};

export default PanicButton;